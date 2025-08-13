install:
	brew install hugo
	brew install wget

# TODO: the mv might not work, requiring a full deletion of the folder... 
# In theory it should move the folder and overrwite any existing files instead
update:
	wget "https://github.com/adityatelange/hugo-PaperMod/archive/master.zip" -O theme.zip
	unzip -d themes -fo theme.zip
	mv themes/hugo-PaperMod-master themes/PaperMod
	rm themes.zip
