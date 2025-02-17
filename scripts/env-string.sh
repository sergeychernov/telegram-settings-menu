#!/bin/bash

function envString {

	ENVIR=""

	for l in $(cat $1); do
		IFS='=' read -ra VARVAL <<< "$l"
		if [ -z "${ENVIR}" ]; then
			ENVIR=${VARVAL[0]}=${VARVAL[1]}
		else
			ENVIR=$ENVIR,${VARVAL[0]}=${VARVAL[1]}
		fi
	done
	echo ${ENVIR}
}