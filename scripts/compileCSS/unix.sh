# Check argument count:
if [ "$1" == "" ]; then
    echo No development mode specified
    exit 1
elif [ "$2" == "" ]; then
    echo No compilation mode specified
    exit 1
fi

# Check argument values:
if [ "$1" == "Production" ]; then
    dir=src
elif [ "$1" == "DevTools" ]; then
    dir=devtools
else
    echo Invalid development mode specified
    exit 1
fi

if [ "$2" == "Single" ]; then
    extraArg=
elif [ "$2" == "Continuous" ]; then
    extraArg=-w
else
    echo Invalid compilation mode specified
    exit 1
fi

# Compile CSS:
npx tailwindcss -i $dir/styles/template.css -o $dir/styles/output.css $extraArg
