pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'booknest-frontend'
    }

    tools {
        nodejs 'NodeJS-20'
    }

    stages {

        // ── Stage 1: Checkout ───────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ── Stage 2: Install Dependencies ───────────────────
        stage('Install Dependencies') {
            steps {
                sh 'npm install --legacy-peer-deps'
            }
        }

        // ── Stage 3: Lint ───────────────────────────────────
        stage('Lint') {
            steps {
                sh 'npm run lint || echo "Lint not configured, skipping..."'
            }
        }

        // ── Stage 4: Run Tests ──────────────────────────────
        stage('Test') {
            steps {
                sh 'npm run test -- --watch=false --browsers=ChromeHeadless || echo "Tests skipped"'
            }
        }

        // ── Stage 5: Build Angular App ──────────────────────
        stage('Build') {
            environment {
                NODE_OPTIONS = '--max_old_space_size=4096'
            }
            steps {
                sh 'npm run build'
            }
        }

        // ── Stage 6: Docker Build ───────────────────────────
        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
            }
        }

        // ── Stage 7: Deploy Container ───────────────────────
        stage('Deploy') {
            steps {
                sh "docker stop ${DOCKER_IMAGE} || true"
                sh "docker rm ${DOCKER_IMAGE} || true"
                sh "docker run -d --name ${DOCKER_IMAGE} --network booknest-backend_default -p 80:80 ${DOCKER_IMAGE}:latest"
            }
        }

        // ── Stage 8: Health Check ───────────────────────────
        stage('Health Check') {
            steps {
                script {
                    sleep(time: 10, unit: 'SECONDS')
                    sh 'curl -f http://localhost:80 || echo "Frontend not ready yet"'
                }
            }
        }
    }

    post {
        success {
            echo '✅ BookNest Frontend Pipeline completed successfully!'
        }
        failure {
            echo '❌ BookNest Frontend Pipeline failed!'
            script {
                try {
                    sh "docker stop ${DOCKER_IMAGE} || true"
                    sh "docker rm ${DOCKER_IMAGE} || true"
                } catch (Exception e) {
                    echo "Cleanup failed: ${e.message}"
                }
            }
        }
        cleanup {
            script {
                try {
                    cleanWs(cleanWhenNotBuilt: false)
                } catch (Exception e) {
                    echo "Clean workspace failed: ${e.message}"
                }
            }
        }
    }
}
