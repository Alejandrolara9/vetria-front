pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        PROJECT_KEY             = 'vetria-frontend'
        PROJECT_NAME            = 'Vetria Frontend'
        GITHUB_URL              = 'https://github.com/Alejandrolara9/vetria-front.git'
        BRANCH                  = 'develop'
        NEXT_TELEMETRY_DISABLED = '1'
        SONARQUBE_URL           = 'http://localhost:9000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "refs/heads/${BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GITHUB_URL}",
                        credentialsId: 'github-pat',
                        refspec: "+refs/heads/${BRANCH}:refs/remotes/origin/${BRANCH}"
                    ]],
                    extensions: [[$class: 'WipeWorkspace']]
                ])
                sh 'echo "Checked out commit: $(git rev-parse HEAD)"'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline'
            }
        }

        stage('Dependency Audit') {
            steps {
                sh 'mkdir -p reports'
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh '''
                        npm audit --audit-level=high --json > reports/npm-audit.json || true
                        npm audit --audit-level=high
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/npm-audit.json', allowEmptyArchive: true
                }
            }
        }

        stage('TypeScript Check') {
            steps {
                sh 'npx tsc --noEmit'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test -- --ci --forceExit --coverage'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                    archiveArtifacts artifacts: 'coverage/lcov.info', allowEmptyArchive: true
                }
            }
        }

        stage('Lint') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh 'npm run lint'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarQubeScanner'
                        sh """
                            ${scannerHome}/bin/sonar-scanner \\
                                -Dsonar.projectKey=${PROJECT_KEY} \\
                                -Dsonar.projectName="${PROJECT_NAME}" \\
                                -Dsonar.projectVersion=${BUILD_NUMBER} \\
                                -Dsonar.sources=src \\
                                -Dsonar.tests=src \\
                                -Dsonar.test.inclusions=**/__tests__/**/*.ts,**/__tests__/**/*.tsx,**/*.spec.ts,**/*.spec.tsx,**/*.test.ts,**/*.test.tsx \\
                                -Dsonar.exclusions=**/node_modules/**,**/.next/**,**/public/**,**/*.d.ts,**/*.css,**/__tests__/**,**/*.spec.ts,**/*.spec.tsx,**/*.test.ts,**/*.test.tsx,**/app/**,**/components/**,**/ui/** \\
                                -Dsonar.sourceEncoding=UTF-8 \\
                                -Dsonar.typescript.tsconfigPath=tsconfig.sonar.json \\
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
            post {
                failure {
                    echo "QUALITY GATE FAILED - Pipeline bloqueado. El codigo no cumple las politicas de SonarQube. Revisa y corrige los hallazgos en ${SONARQUBE_URL}/dashboard?id=${PROJECT_KEY} antes de volver a hacer push."
                }
            }
        }
    }

    post {
        always {
            cleanWs(cleanWhenNotBuilt: false,
                    deleteDirs: true,
                    disableDeferredWipeout: true)
        }
        success {
            echo "Pipeline ${PROJECT_NAME} - Build #${BUILD_NUMBER} completed successfully."
        }
        failure {
            echo "Pipeline ${PROJECT_NAME} - Build #${BUILD_NUMBER} FALLIDO. Revisa los hallazgos en ${SONARQUBE_URL}/dashboard?id=${PROJECT_KEY}"
        }
    }
}
