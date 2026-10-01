# 공식 SAP BTP 템플릿 적용

사용자가 제공한 SAP_BTP.potx의 theme1.xml, 마스터와 표지·목차·구분·본문·표 레이아웃을 확인했다. 16:9 캔버스를 HTML의 1600×900에 대응시키고, 본문 여백 약 66px, 검정 제목, 흰 본문 배경, SAP Blue 계열과 원본 템플릿의 SAP BTP 로고를 적용했다.

표지는 template slide 1의 오른쪽 패턴, 목차는 slide 5의 오른쪽 그래픽, 구분 페이지는 slide 6의 하단 Blue 그래픽을 사용한다. 그래픽 영역만 추출해 예시 제목·푸터·페이지 번호는 포함하지 않는다. 원본 POTX는 저장소에 추가하지 않았다. 출처 해시와 추출 좌표는 sap-official-template-provenance.json에 기록했다.

템플릿의 글꼴은 72 Brand Medium / 72 Brand로 선언하며, 미설치 환경과 한글은 Malgun Gothic / Noto Sans CJK KR / Arial로 대체한다. POTX에 포함된 압축 Office 임베디드 폰트는 웹용으로 임의 변환·배포하지 않았다. 템플릿은 기본 한글 글꼴을 별도로 지정하지 않는다.

사용자 요구에 따라 출처·반복 푸터는 발표 화면에 표시하지 않는다. 원본 템플릿에는 INTERNAL – SAP and External Parties under NDA Only 표시가 있으며, 이 기록은 원본의 분류나 이용 조건을 바꾸지 않는다. 기존 SAP PDF 그림은 내부 라벨과 색을 변경하지 않고 유지했다.
