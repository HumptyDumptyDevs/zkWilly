AWS_REGION := eu-central-1
ECR_REPOSITORY_URI := 565802942559.dkr.ecr.eu-central-1.amazonaws.com
IMAGE := zkwilly-dev-fetch-transactions

build:
	docker build --no-cache -t ${IMAGE} .
	docker tag ${IMAGE}:latest ${ECR_REPOSITORY_URI}/${IMAGE}:latest
	docker tag ${IMAGE}:latest ${ECR_REPOSITORY_URI}/${IMAGE}:${VERSION}

push: 
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REPOSITORY_URI)
	docker push ${ECR_REPOSITORY_URI}/${IMAGE}:latest
	docker push ${ECR_REPOSITORY_URI}/${IMAGE}:${VERSION}

build-push: build push

update-lambda:
	aws lambda update-function-code \
     --function-name ${IMAGE} \
     --image-uri ${ECR_REPOSITORY_URI}/${IMAGE}:latest > /dev/null

clean:
	docker image prune -f -a

redeploy: clean build-push update-lambda