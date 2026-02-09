pipeline {
  agent any

  environment {
    REGISTRY_IMAGE = 'rafasdoliveira/meu-bolso-api'
    SONAR_PROJECT_KEY = 'meu-bolso-api'
    SONAR_HOST_URL = 'http://sonarqube:9000'
  }

  stages {
    stage('Checkout & Clean') {
      steps {
        cleanWs()
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Tests & Coverage') {
      steps {
        sh 'npm run test:cov'
      }
    }

    stage('SonarQube Scan') {
      environment {
        SONAR_TOKEN = credentials('sonar-token')
      }
      steps {
        withSonarQubeEnv('SONAR_LOCAL') {
          sh '''
        npx sonar-scanner \
          -Dsonar.projectKey=meu-bolso-api \
          -Dsonar.sources=src \
          -Dsonar.tests=src,test \
          -Dsonar.test.inclusions="src/**/*.spec.ts,test/**/*.e2e-spec.ts" \
          -Dsonar.exclusions="src/**/*.spec.ts,src/main.ts,src/migrations/*.ts,src/**/*.dto.ts,src/**/*.entity.ts,src/**/*.module.ts,src/coverage/**/*" \
          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
          -Dsonar.host.url=http://sonarqube:9000 \
          -Dsonar.login=$SONAR_TOKEN
      '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Trivy Repo Scan') {
      steps {
        sh '''
          trivy fs \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            --cache-dir /var/jenkins_home/trivy_cache \
            --skip-version-check \
            --scanners vuln \
            .
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh "docker build --no-cache -t $REGISTRY_IMAGE:${GIT_COMMIT} ."
        sh "docker tag $REGISTRY_IMAGE:${GIT_COMMIT} $REGISTRY_IMAGE:dev"
        sh "docker push $REGISTRY_IMAGE:${GIT_COMMIT}"
        sh "docker push $REGISTRY_IMAGE:dev"
      }
    }

    stage('Promote to STG') {
      input {
          message "Deseja promover esta imagem para STAGING?"
          ok "Promover"
      }
      steps {
        script {
            sh "docker tag $REGISTRY_IMAGE:${GIT_COMMIT} $REGISTRY_IMAGE:stg"
            sh "docker push $REGISTRY_IMAGE:stg"
            echo "Imagem promovida para STAGING com sucesso!"
        }
      }
    }

    stage('Promote to PROD') {
      input {
          message "Deseja promover esta imagem para PRODUÇÃO?"
          ok "Aprovar Release"
      }
      steps {
        script {
            sh "docker tag $REGISTRY_IMAGE:${GIT_COMMIT} $REGISTRY_IMAGE:prod"
            sh "docker push $REGISTRY_IMAGE:prod"
            echo "Imagem promovida para PRODUÇÃO! Pronta para deploy manual."
        }
      }
    }

    stage('Trivy Image Scan') {
      steps {
        sh '''
          # Vulnerabilidades ignoradas temporariamente via .trivyignore
          # Motivo: Versões seguras já estão no package.json, mas persistem em
          # dependências transitivas que estão sendo tratadas via overrides.
          trivy image --severity HIGH,CRITICAL --exit-code 1 \
            $REGISTRY_IMAGE:${GIT_COMMIT}
        '''
      }
    }

    stage('Create Git Tag') {
      when {
        anyOf {
            branch 'main'
            branch 'configArt'
        }
      }
      steps {
        script {
          def branchName = env.BRANCH_NAME
          echo "Tentando push na branch: ${branchName}"
          sh "git checkout ${branchName} && git pull origin ${branchName}"
          sh 'git config user.email "jenkins@meubolso.com"'
          sh 'git config user.name "Jenkins CI"'
          if (branchName == 'main') {
            sh "npm version patch -m 'chore(release): %s [skip ci]'"
          } else {
            sh "npm version prepatch --preid=${branchName} -m 'chore(env-release): %s [skip ci]'"
          }
          withCredentials([usernamePassword(credentialsId: 'git-credentials', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
            sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/rafasdoliveira/meu-bolso-api.git ${branchName} --tags --force"
          }
        }
      }
    }
  }
}
