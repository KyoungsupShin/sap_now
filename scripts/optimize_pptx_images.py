"""Convert RGB PNGs to high-quality JPEG when this reduces PPTX size."""
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import argparse
import zlib

from lxml import etree
from PIL import Image


def optimize(path):
    path = Path(path)
    temporary = path.with_suffix('.images.tmp')
    before = path.stat().st_size
    replacements = {}
    try:
        with ZipFile(path) as source:
            for entry in source.infolist():
                name = entry.filename
                if not (name.startswith('ppt/media/') and name.endswith('.png')):
                    continue
                with Image.open(BytesIO(source.read(name))) as image:
                    if image.mode != 'RGB':
                        continue
                    buffer = BytesIO()
                    image.save(buffer, 'JPEG', quality=95, subsampling=0, optimize=True)
                    candidate = buffer.getvalue()
                    if len(zlib.compress(candidate, 9)) >= entry.compress_size:
                        continue
                    new_name = str(Path(name).with_suffix('.jpg'))
                    assert new_name not in source.namelist()
                    with Image.open(BytesIO(candidate)) as check:
                        assert check.size == image.size
                    replacements[name] = (new_name, candidate)
            with ZipFile(temporary, 'w', ZIP_DEFLATED, compresslevel=9) as output:
                output.comment = source.comment
                for entry in source.infolist():
                    name = entry.filename
                    data = source.read(name)
                    if name in replacements:
                        name, data = replacements[name]
                    elif name.endswith('.rels'):
                        root = etree.fromstring(data)
                        changed = False
                        for rel in root:
                            target = rel.get('Target', '')
                            for old, (new, _) in replacements.items():
                                if target.endswith('/' + Path(old).name):
                                    rel.set('Target', target[:-len(Path(old).name)] + Path(new).name)
                                    changed = True
                        if changed:
                            data = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
                    elif name == '[Content_Types].xml' and replacements:
                        root = etree.fromstring(data)
                        ns = root.nsmap[None]
                        if not any(e.get('Extension') == 'jpg' for e in root):
                            etree.SubElement(root, '{' + ns + '}Default', Extension='jpg', ContentType='image/jpeg')
                        for element in root:
                            part = element.get('PartName', '').lstrip('/')
                            if part in replacements:
                                element.set('PartName', '/' + replacements[part][0])
                                element.set('ContentType', 'image/jpeg')
                        data = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
                    output.writestr(name, data)
            with ZipFile(temporary) as result:
                assert result.testzip() is None
                for name in source.namelist():
                    if name in replacements or name.endswith('.rels') or name == '[Content_Types].xml':
                        continue
                    assert source.read(name) == result.read(name), name
            if temporary.stat().st_size < before:
                temporary.replace(path)
            print(f'{path.name}: {before:,} -> {path.stat().st_size:,} bytes; {len(replacements)} images converted.')
    finally:
        temporary.unlink(missing_ok=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pptx', type=Path)
    optimize(parser.parse_args().pptx)
