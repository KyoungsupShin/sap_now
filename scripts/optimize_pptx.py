"""Losslessly compress PPTX PNGs without changing pixels or slide XML."""
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import sys
import zlib

from PIL import Image


def optimize_pptx(path):
    path = Path(path)
    before = path.stat().st_size
    temporary = path.with_suffix('.optimized.tmp')
    changed = 0
    try:
        with ZipFile(path) as original, ZipFile(temporary, 'w') as result:
            result.comment = original.comment
            for entry in original.infolist():
                data = original.read(entry.filename)
                if entry.filename.startswith('ppt/media/') and entry.filename.endswith('.png'):
                    with Image.open(BytesIO(data)) as image:
                        buffer = BytesIO()
                        options = {'optimize': True, 'compress_level': 9}
                        for key in ('dpi', 'icc_profile'):
                            if key in image.info:
                                options[key] = image.info[key]
                        image.save(buffer, format='PNG', **options)
                        candidate = buffer.getvalue()
                        with Image.open(BytesIO(candidate)) as check:
                            assert check.size == image.size
                            assert check.mode == image.mode
                            assert check.convert('RGBA').tobytes() == image.convert('RGBA').tobytes()
                        if len(zlib.compress(candidate, 6)) < len(zlib.compress(data, 6)):
                            data = candidate
                            changed += 1
                result.writestr(entry, data)
        with ZipFile(path) as original, ZipFile(temporary) as result:
            assert original.namelist() == result.namelist()
            assert result.testzip() is None
            for name in original.namelist():
                if not (name.startswith('ppt/media/') and name.endswith('.png')):
                    assert original.read(name) == result.read(name), name
        after = temporary.stat().st_size
        if after < before:
            temporary.replace(path)
        else:
            after = before
        print(f'{path.name}: {before:,} -> {after:,} bytes; {changed} PNGs optimized; pixels unchanged.')
    finally:
        temporary.unlink(missing_ok=True)


if __name__ == '__main__':
    for argument in sys.argv[1:]:
        optimize_pptx(argument)
