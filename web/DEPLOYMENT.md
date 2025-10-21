# Netlify 배포 가이드

이 문서는 uni-guide 웹 애플리케이션을 Netlify에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

1. **Netlify 계정**: [https://www.netlify.com](https://www.netlify.com)에서 무료 계정 생성
2. **Gabia 도메인**: 도메인 구매 완료
3. **GitHub/GitLab/Bitbucket 계정**: 코드 저장소 (선택사항)

## 🚀 배포 방법

### 방법 1: Netlify CLI를 사용한 배포 (권장)

#### 1단계: Netlify CLI 설치
```bash
npm install -g netlify-cli
```

#### 2단계: Netlify 로그인
```bash
netlify login
```
브라우저가 열리면 Netlify 계정으로 로그인하세요.

#### 3단계: web 디렉토리로 이동
```bash
cd web
```

#### 4단계: 의존성 설치
```bash
npm install
```

#### 5단계: 빌드 테스트
```bash
npm run build
```
빌드가 성공적으로 완료되는지 확인하세요.

#### 6단계: Netlify에 배포
```bash
netlify deploy
```

첫 배포 시 다음 질문들이 나옵니다:
- **Create & configure a new site?** → `Yes`
- **Team** → 본인의 팀 선택
- **Site name** → 원하는 사이트 이름 입력 (예: `uni-guide`)
- **Publish directory** → `build` 입력

배포가 완료되면 임시 URL이 제공됩니다.

#### 7단계: 프로덕션 배포
```bash
netlify deploy --prod
```

### 방법 2: Netlify 웹 인터페이스를 사용한 배포

#### 1단계: GitHub에 코드 푸시
```bash
cd web
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repository-url>
git push -u origin main
```

#### 2단계: Netlify에서 사이트 생성
1. [Netlify 대시보드](https://app.netlify.com) 접속
2. **Add new site** → **Import an existing project** 클릭
3. GitHub/GitLab/Bitbucket 선택 후 저장소 연결
4. 빌드 설정:
   - **Branch to deploy**: `main` (또는 사용 중인 브랜치)
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. **Deploy site** 클릭

#### 3단계: 배포 확인
배포가 완료되면 `https://random-name.netlify.app` 형식의 URL이 제공됩니다.

## 🌐 Gabia 도메인 연결하기

### 1단계: Netlify에서 도메인 추가
1. Netlify 대시보드에서 사이트 선택
2. **Domain settings** 클릭
3. **Add custom domain** 클릭
4. Gabia에서 구매한 도메인 입력 (예: `yourdomain.com`)
5. **Verify** 클릭

### 2단계: Gabia에서 DNS 설정
Gabia 관리자 페이지에서 다음 DNS 레코드를 추가하세요:

#### A 레코드 (루트 도메인용)
```
Type: A
Host: @
Value: 75.2.60.5
TTL: 3600
```

#### CNAME 레코드 (www 서브도메인용)
```
Type: CNAME
Host: www
Value: your-site-name.netlify.app
TTL: 3600
```

**참고**: `your-site-name.netlify.app`는 Netlify가 제공하는 실제 URL로 변경하세요.

### 3단계: SSL 인증서 설정
1. Netlify 대시보드에서 **Domain settings** → **HTTPS** 클릭
2. **Verify DNS configuration** 클릭
3. DNS 설정이 올바르게 되었다면 자동으로 SSL 인증서가 발급됩니다
4. 발급 완료까지 5-10분 정도 소요될 수 있습니다

### 4단계: 도메인 확인
DNS 전파가 완료되면 (최대 24-48시간 소요) 도메인으로 접속 가능합니다.

## 🔧 빌드 설정

프로젝트에는 이미 `netlify.toml` 파일이 설정되어 있습니다:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

이 설정은 다음을 자동으로 처리합니다:
- 빌드 명령어 실행
- 빌드 결과물 배포
- SPA 라우팅 지원 (모든 경로를 index.html로 리다이렉트)
- Node.js 버전 지정

## 🔄 자동 배포 설정

GitHub와 연동한 경우, 코드를 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update features"
git push
```

푸시 후 Netlify 대시보드에서 배포 진행 상황을 확인할 수 있습니다.

## 📝 환경 변수 설정 (필요시)

환경 변수가 필요한 경우:

1. Netlify 대시보드에서 사이트 선택
2. **Site settings** → **Environment variables** 클릭
3. **Add a variable** 클릭
4. 변수 이름과 값 입력
5. **Save** 클릭

## 🐛 문제 해결

### 빌드 실패
- `npm install`이 제대로 실행되는지 확인
- `package.json`의 의존성이 올바른지 확인
- Netlify 빌드 로그에서 에러 메시지 확인

### 도메인 연결 안 됨
- DNS 설정이 올바른지 확인
- DNS 전파 시간 기다리기 (최대 48시간)
- Gabia에서 DNS 설정이 저장되었는지 확인

### SPA 라우팅 문제
- `public/_redirects` 파일이 존재하는지 확인
- `netlify.toml`의 redirects 설정 확인

## 📞 지원

문제가 발생하면:
1. Netlify 빌드 로그 확인
2. Netlify 문서: [https://docs.netlify.com](https://docs.netlify.com)
3. Gabia 고객센터: DNS 설정 관련 문의

## 🎉 완료!

배포가 완료되면 다음 주소로 접속할 수 있습니다:
- Netlify URL: `https://your-site-name.netlify.app`
- 커스텀 도메인: `https://yourdomain.com`

