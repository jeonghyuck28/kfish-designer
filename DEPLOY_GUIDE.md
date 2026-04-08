# K·FISH 시안 생성기 - 배포 가이드

## 사전 준비

- **여분 PC** (Windows 10/11)
- **Node.js LTS** 설치: https://nodejs.org
- 폴더명에 한글/공백 없는 경로 사용 (예: `C:\kfish-designer`)

---

## 1. 프로젝트 복사

시안생성기 폴더를 여분 PC에 복사합니다.

```
복사할 것:
├── server.js
├── package.json
├── web.config
├── install-service.js
├── uninstall-service.js
├── index.html
├── css/
├── js/
├── images/
├── database.db          ← 기존 데이터 유지 시 복사
└── uploads/             ← 업로드된 이미지 유지 시 복사

복사 안 해도 되는 것:
├── node_modules/        ← npm install로 재설치
└── backups/             ← 자동 생성됨
```

---

## 2. 패키지 설치

```bash
cd C:\kfish-designer
npm install
```

> `better-sqlite3`는 네이티브 모듈이므로 PC마다 `npm install` 필수

---

## 3. 서버 테스트

```bash
node server.js
```

- `http://localhost:3000` 접속하여 정상 동작 확인
- 확인 후 `Ctrl+C`로 종료

---

## 4. Windows 서비스 등록 (자동 시작)

PC 재부팅 시에도 자동으로 서버가 실행되도록 서비스로 등록합니다.

```bash
# node-windows 설치 (최초 1회)
npm install -g node-windows

# 서비스 등록
node install-service.js
```

- Windows 서비스 목록에 **KFish Designer** 등록됨
- PC 재부팅 시 자동 시작

```bash
# 서비스 삭제 시
node uninstall-service.js
```

---

## 5. 방화벽 설정 (접근 제한)

타인 접속을 차단하려면 Windows 방화벽에서 허용 IP만 설정합니다.

### 방법 A: Windows 방화벽 (추천)

1. **Windows 방화벽** > 고급 설정 > **인바운드 규칙** > 새 규칙
2. **포트** 선택 > TCP 포트: `3000`
3. **연결 허용**
4. 규칙 이름: `KFish Designer`
5. 생성된 규칙 더블클릭 > **범위** 탭
6. **원격 IP 주소** > "다음 IP 주소" 선택
7. 허용할 IP 추가:
   - `127.0.0.1` (로컬)
   - 사무실 공인 IP (예: `123.456.789.0`)
   - 사무실 내부 대역 (예: `192.168.0.0/24`)

### 방법 B: IIS 리버스 프록시 + IP 제한

IIS를 통해 접근하려면:

1. **IIS 모듈 설치**
   - URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite
   - ARR: https://www.iis.net/downloads/microsoft/application-request-routing
2. IIS에서 사이트 추가 > 물리 경로: `C:\kfish-designer`
3. `web.config`의 `ipSecurity` 섹션에 허용 IP 추가

```xml
<ipSecurity allowUnlisted="false">
    <add allowed="true" ipAddress="127.0.0.1" />
    <add allowed="true" ipAddress="사무실공인IP" />
</ipSecurity>
```

---

## 6. 접속

```
http://PC내부IP:3000
```

또는 IIS 프록시 사용 시:

```
http://도메인 또는 IP
```

---

## 백업

### 자동 백업
- 서버 시작 시 1회 자동 백업
- **매일 03시** 자동 백업
- `backups/` 폴더에 최근 **30개** 보관, 오래된 것 자동 삭제

### 수동 백업
- 상단 툴바 **DB 백업** 버튼 클릭 → `.db` 파일 다운로드

### 백업 복원
1. 서버 중지
2. `database.db`를 백업 파일로 교체
3. 서버 재시작

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| `npm install` 실패 | Node.js 재설치, `npm cache clean --force` 후 재시도 |
| `better-sqlite3` 에러 | `npm install --build-from-source` |
| 서비스 시작 안 됨 | 이벤트 뷰어 확인, `node server.js`로 직접 실행하여 에러 확인 |
| 외부 접속 안 됨 | 방화벽 인바운드 규칙 확인, 포트 3000 허용 여부 |
| 이미지 업로드 안 됨 | `uploads/` 폴더 존재 여부 및 쓰기 권한 확인 |

---

## 파일 구조

```
C:\kfish-designer\
├── server.js              ← Express 서버 (포트 3000)
├── package.json           ← 패키지 정보
├── database.db            ← SQLite DB (자동 생성)
├── web.config             ← IIS 리버스 프록시 설정
├── install-service.js     ← Windows 서비스 등록
├── uninstall-service.js   ← Windows 서비스 삭제
├── index.html             ← 프론트엔드
├── css/
│   ├── style.css          ← 생성기 UI
│   └── template.css       ← 시안 템플릿
├── js/
│   ├── app.js             ← 메인 로직
│   └── api.js             ← API 통신
├── images/                ← 템플릿 고정 이미지
├── uploads/               ← 업로드 이미지 (자동 생성)
└── backups/               ← DB 백업 (자동 생성)
```
