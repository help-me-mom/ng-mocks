#!/bin/bash
set -e

child_pid=0
parent_pid=$$

fork() {
    echo ${@} | xargs -t -I % sh -c "%"
}

if [[ ! "${ENTRYPOINT_SKIP}" ]]; then
for file in `ls -v /docker-entrypoint.d/*.sh`
    do
        fork ${file} &
        child_pid=$!
        wait ${child_pid}
        if [[ "${?}" != "0" ]]; then
            exit 1;
        fi
    done
fi

fork ${@} &
child_pid=$!
wait ${child_pid}
