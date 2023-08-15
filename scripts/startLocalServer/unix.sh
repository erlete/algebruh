# Check argument count:
if [ "$1" == "" ]; then
    echo No development mode specified
    exit 1
elif [ "$2" == "" ]; then
    echo No port specified
    exit 1
fi

# Check argument values:
if [ "$1" == "Production" ]; then
    dir=src
elif [ "$1" == "DevTools" ]; then
    dir=.
else
    echo Invalid development mode specified
    exit 1
fi

# Start local server:
php -S localhost:$2 -t $dir
