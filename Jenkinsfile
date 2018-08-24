def project = 'jenkins-test-214312'
def  backendImageTag = "gcr.io/${project}/backend:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"
def  frontendImageTag = "gcr.io/${project}/frontend:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"

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
    stage('Build and push image with Container Builder') {
      steps {
        container('gcloud') {
          sh "cd backend && gcloud builds submit -t ${backendImageTag} ."
          sh "cd frontend && gcloud builds submit -t ${frontendImageTag} ."
        }
      }
    }
    stage('Deploy Canary') {
      // Canary branch
      when { branch 'canary' }
      steps {
        container('kubectl') {
          // Change deployed image in canary to the one we just built
          sh("sed -i.bak 's#gcr.io/${project}/backend:v1#${backendImageTag}#' ./kubernetes/canary/*.yml")
          sh("sed -i.bak 's#gcr.io/${project}/backend:v1#${frontendImageTag}#' ./kubernetes/canary/*.yml")
          sh("kubectl --namespace=production apply -f kubernetes/service/")
          sh("kubectl --namespace=production apply -f kubernetes/canary/")
        } 
      }
    }
    stage('Deploy Production') {
      // Production branch
      when { branch 'master' }
      steps{
        container('kubectl') {
        // Change deployed image in canary to the one we just built
          sh("sed -i.bak 's#gcr.io/${project}/backend:v1#${backendImageTag}#' ./kubernetes/production/*.yml")
          sh("sed -i.bak 's#gcr.io/${project}/backend:v1#${frontendImageTag}#' ./kubernetes/production/*.yml")
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
          sh("sed -i.bak 's#LoadBalancer#ClusterIP#' ./kubernetes/service/frontend.yml")
          sh("sed -i.bak 's#gcr.io/${project}/backend:v1#${backendImageTag}#' ./kubernetes/dev/*.yml")
          sh("sed -i.bak 's#gcr.io/${project}/backend:v1#${frontendImageTag}#' ./kubernetes/dev/*.yml")
          sh("kubectl --namespace=${env.BRANCH_NAME} apply -f kubernetes/service/")
          sh("kubectl --namespace=${env.BRANCH_NAME} apply -f kubernetes/dev/")
          echo 'To access your environment run `kubectl proxy`'
          echo "Then access your service via http://localhost:8001/api/v1/proxy/namespaces/${env.BRANCH_NAME}/services/frontend:8100/"
        }
      }     
    }
  }
}
