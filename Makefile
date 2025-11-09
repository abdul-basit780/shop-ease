build:
	docker build . --tag ghcr.io/abdul-basit780/shop-ease

push:
	docker push ghcr.io/abdul-basit780/shop-ease

bp: build push