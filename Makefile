assets_dir = _site/assets/

cms_source_dir = node_modules/netlify-cms/dist/
cms_objects = cms.js cms.js.map cms.css
cms_sources = $(addprefix $(cms_source_dir), $(cms_objects))
cms_targets = $(addprefix $(assets_dir), $(cms_objects))

identity_source_dir = node_modules/netlify-identity-widget/build/
identity_objects = netlify-identity-widget.js netlify-identity-widget.js.map
identity_sources = $(addprefix $(identity_source_dir), $(identity_objects))
identity_targets = $(addprefix $(assets_dir), $(identity_objects))

all_sources = $(cms_sources) $(identity_sources)
all_targets = $(cms_targets) $(identity_targets)

.PHONY: all
all: $(all_targets)

$(assets_dir):
	mkdir -p "$(assets_dir)"

$(all_sources):
	if [ \! -f $@ ]; then npm install; fi

$(cms_targets): $(assets_dir) $(cms_sources)
	cp $(cms_source_dir)$(@F) $@

$(identity_targets): $(assets_dir) $(identity_sources)
	cp $(identity_source_dir)$(@F) $@

.PHONY: clean
clean:
	-rm $(all_targets)
	-rmdir -p $(assets_dir)
