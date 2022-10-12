#!/bin/bash
docker build -t mianjazibali/ifragen .
docker push mianjazibali/ifragen

ssh deploy@$DEPLOY_SERVER << EOF
docker pull mianjazibali/ifragen
docker stop ifragen_app || true
docker rm ifragen_app || true
docker rmi mianjazibali/ifragen:current || true
docker tag mianjazibali/ifragen:latest mianjazibali/ifragen:current
docker run -d --restart always --name ifragen_app -p 3000:3000 mianjazibali/ifragen:current
EOF
