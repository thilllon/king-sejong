# king-sejong

> [Probot](https://github.com/probot/probot) 기반의 GitHub App으로 GitHub Pull Request에 한글문자가 포함되어 있는지 감지하는 기능을 한다.

한글 문자가 포함되어있는 Pull Request(이하 PR)이 생성되면 해당 문자열에 comment가 생성되고, 한글문자로 된 파일이 PR에 포함되면 강제로 PR을 닫는다.

vercel에 배포하는 것을 가정한다. 이때 다음 환경변수 설정이 필수적이다. 이것은 probot 공식 문서의 vercel deployment 섹션에서 확인할 수 있다.

```sh
NODEJS_HELPERS=0
```

## Setup

```sh
# dependencies 설치
pnpm install

# tsconfig.json 확인시 src 폴더를 빌드타겟으로하여 lib 폴더를 생성한다.
pnpm build

# probot request handler를 실행시킨다.
pnpm start
```

## Files

- `api/github/webhooks/index.js` : probot request handler가 위치하고 있다. 해당 경로(`https://<SOME_URL>/api/github/webhook`)로 접근하는 `POST` 요청을 처리한다. 빌드결과로 생성된 `lib/app.js`를 참조하는 것을 확인할 수 있다.
- `app.yml`: 파일은 초기 probot 프로젝트를 세팅할 때만 필요하고 현재는 필요없으나 어떤 events가 있는지, 어떤 permissions가 있는지 확인할 수 있는 용도로 남겨두었다.
- `index.html`: 배포 결과 인덱스 경로(`https://<SOME_URL>/`)로 접근하는 `GET` 요청을 처리한다.
