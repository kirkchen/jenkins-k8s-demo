def project = 'jenkins-test-214312'
def  imageTag = "gcr.io/${project}/sample:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"

pipeline {
  agent {
    kubernetes {
      label 'sample'
      defaultContainer 'jnlp'
      yaml """
apiVersion: v1
kind: Pod
metadata:
labels:
  component: ci
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: cd-jenkins
  containers:
  - name: node
    image: node:8.11.4
    command:
    - cat
    tty: true
  - name: gcloud
    image: gcr.io/cloud-builders/gcloud
    command:
    - cat
    tty: true
  - name: kubectl
    image: gcr.io/cloud-builders/kubectl
    command:
    - cat
    tty: true
"""
}
  }
  stages {
    stage('Test') {
      steps {
        container('node') {
          sh "npm install"
          sh "npm test"
        }
      }
      post {
        always {
          junit "reports/unittest.xml"
        }
      }
    }
    stage('Build and push image with Container Builder') {
      steps {
        container('gcloud') {
          sh "gcloud builds submit -t ${imageTag} ."
        }
      }
    }
    stage('Deploy Canary') {
      // Canary branch
      when { branch 'canary' }
      steps {
        container('kubectl') {
          // Change deployed image in canary to the one we just built
          sh("sed -i.bak 's#gcr.io/${project}/sample:v1#${imageTag}#' ./kubernetes/canary/*.yml")
          sh("kubectl --namespace=production apply -f kubernetes/service/")
          sh("kubectl --namespace=production apply -f kubernetes/canary/")
        } 
      }
    }
    stage('Deploy Production') {
      // Production branch
      when { branch 'master' }
      steps {
        container('kubectl') {
          // Change deployed image in canary to the one we just built
          sh("sed -i.bak 's#gcr.io/${project}/sample:v1#${imageTag}#' ./kubernetes/production/*.yml")
          sh("kubectl --namespace=production apply -f kubernetes/service/")
          sh("kubectl --namespace=production apply -f kubernetes/production/")
        } 
      }
    }
    stage('Deploy Dev') {
      // Developer Branches
      when { 
        not { branch 'master' } 
        not { branch 'canary' }
      } 
      steps {
        container('kubectl') {
          // Create namespace if it doesn't exist
          sh("kubectl get ns ${env.BRANCH_NAME} || kubectl create ns ${env.BRANCH_NAME}")
          // Don't use public load balancing for development branches
          sh("sed -i.bak 's#LoadBalancer#ClusterIP#' ./kubernetes/service/sample-service.yml")
          sh("sed -i.bak 's#gcr.io/${project}/sample:v1#${imageTag}#' ./kubernetes/dev/*.yml")
          sh("kubectl --namespace=${env.BRANCH_NAME} apply -f kubernetes/service/")
          sh("kubectl --namespace=${env.BRANCH_NAME} apply -f kubernetes/dev/")
          echo 'To access your environment run `kubectl proxy`'
          echo "Then access your service via http://localhost:8001/api/v1/proxy/namespaces/${env.BRANCH_NAME}/services/sample:3000/"
        }
      }     
    }
  }
}
