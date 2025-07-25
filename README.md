# Node.js & TypeScript 웹 애플리케이션 예제

이 프로젝트는 Node.js, Express, TypeScript, Socket.io를 사용하여 구축된 간단한 웹 애플리케이션입니다.
Gemini-CLI에 명령만을 사용하여 사용자의 직접적인 코드 수정 없이 생성되었습니다.

## 기능

- **로그인 페이지 (`/`)**: 사용자 이름은 최대 12자까지 입력할 수 있습니다.
- **사용자 페이지 (`/users`)**:
  - **로그아웃**: 우측 최상단에 위치한 작고 깔끔한 버튼으로 로그인 페이지로 돌아갑니다.
  - **별 모양 아이콘 제어**: 사용자 페이지에 표시되는 별 모양 아이콘을 키보드 방향키로 움직일 수 있습니다.
  - **월드 맵 이동**: 사용자의 별이 3000x3000px 크기의 월드 맵을 자유롭게 이동할 수 있습니다.
  - **카메라 팔로우**: 사용자의 별이 항상 화면 중앙에 보이도록 카메라가 별을 따라 움직입니다. 다른 사용자에게 밀려날 경우에도 카메라가 즉시 반응하여 별을 따라갑니다.
  - **월드 맵 오브젝트**: 이동 가능한 영역과 불가능한 영역이 색상으로 구분되며, 월드 맵 곳곳에 고정된 오브젝트들이 배치되어 이동감을 높입니다.
  - **별 충돌 처리**: 별끼리 충돌 시 서로 밀려나도록 동작합니다.
  - **별 시작 위치**: 접속 시 별은 랜덤한 위치에서 시작합니다.
  - **실시간 동기화**: 다른 사용자의 별 움직임과 채팅이 실시간으로 동기화됩니다.
  - **접속 중인 사용자 목록**: 좌측 상단에 현재 접속 중인 사용자들의 이름과 접속 유지 시간이 테이블 형태로 표시됩니다. (이름, 접속 시간 순서로 출력되며, 접속 시간은 우측 정렬됩니다.)
  - **채팅 기능**:
    - 팝업 형태의 채팅창이 좌측 하단에 위치하며, 기본적으로 최소화 상태입니다.
    - 투명도 조절 슬라이더가 포함되어 있으며, 키보드로는 제어되지 않습니다.
    - 최소화/최대화 기능이 있습니다. (Enter 키 또는 버튼으로 토글)
    - 메시지 입력 시 해당 사용자의 별 위에 5초간 말풍선으로 메시지가 표시됩니다. 말풍선 텍스트는 한 줄에 20자씩 출력되며, 20자를 초과할 경우 여러 줄로 줄바꿈됩니다.
    - 채팅 메시지에는 입력 시간이 함께 표시됩니다.

## 프로젝트 구조

```
.
├── public/
│   ├── favicon.ico       # 정적 파비콘 파일
│   └── js/
│       └── users.ts      # 사용자 페이지 클라이언트 측 TypeScript
│       └── dist/         # 컴파일된 클라이언트 측 JavaScript 파일
│           └── users.js
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   │   ├── index.ts      # 로그인 페이지 라우터
│   │   └── users.ts      # 사용자 페이지 라우터
│   └── services/
│   └── util/             # 유틸리티 모듈
│       └── index.ts
├── index.ts              # Express 서버 메인 파일 (Socket.io 통합)
├── package.json          # 프로젝트 의존성 및 스크립트
├── tsconfig.json         # TypeScript 컴파일러 설정
└── ...
```

## 실행 방법

1. **의존성 설치**:
   ```bash
   npm install // ADD node_modules
   ```

2. **클라이언트 스크립트 컴파일**:
   사용자 페이지의 기능을 활성화하려면 클라이언트 측 TypeScript 파일을 JavaScript로 컴파일해야 합니다.
   ```bash
   npm run build:client
   ```

3. **서버 시작**:
   ```bash
   npm start
   ```

4. **애플리케이션 접속**:
   - 웹 브라우저를 열고 `http://localhost:3000` 으로 접속합니다.

## 참고 사항

- `TSError` 해결을 위해 클라이언트 측 JavaScript 코드를 별도의 `.js` 파일(`public/js/users.js`)로 분리했습니다. 이는 서버 측 TypeScript 컴파일러가 HTML 문자열 내의 클라이언트 스크립트를 잘못 해석하는 것을 방지하기 위함입니다.
