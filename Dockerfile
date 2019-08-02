FROM        alpine:latest
MAINTAINER  mrthanlon "i@anclx.cc"
RUN         mkdir /root/app
COPY        . /root/app/
RUN         sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN         apk update
RUN         apk add --no-cache nodejs npm
RUN         cd /root/app && npm install --registry=https://registry.npm.taobao.org
CMD         cd /root/app && node index.js