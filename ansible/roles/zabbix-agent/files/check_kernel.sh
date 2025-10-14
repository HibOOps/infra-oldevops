#!/bin/bash

export LATEST_KERNEL_VERSION_INSTALLED=$(apt list --installed 2> /dev/null | grep "linux-image" | grep -v "linux-image-amd64" | grep -v "linux-image-cloud-amd64" | tail -n1 | cut -d '/' -f1 | sed 's/linux-image-//g')
export CURRENT_KERNEL_VERSION_USED=$(uname -r)

if [[ "$LATEST_KERNEL_VERSION_INSTALLED" == "$CURRENT_KERNEL_VERSION_USED" ]]; then
    echo "Current kernel used is the latest installed."
else
    echo "Current kernel used is not the latest installed."
fi
