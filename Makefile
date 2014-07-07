GENERATED_FILES = \
	opentype.js \
	opentype.min.js

all: $(GENERATED_FILES)

.PHONY: clean all test

test:
	@npm test

opentype.js: $(shell node_modules/.bin/browserify --list src/opentype.js) package.json
	@rm -f $@
	node_modules/.bin/browserify src/opentype.js > $@
	@chmod a-w $@

opentype.min.js: opentype.js
	@rm -f $@
	node_modules/.bin/uglifyjs $< > $@

clean:
	rm -f -- $(GENERATED_FILES)