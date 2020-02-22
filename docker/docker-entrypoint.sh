#!/bin/bash
echo "${0}:start"

child_pid=0
parent_pid=$$

trap catch_exits TERM KILL INT

catch_exits() {
    echo "${0}:stop '${child_pid}'"
    kill ${child_pid} &
    wait
    echo "${0}:exit"
    exit 1
}

set -e
command=${@}

for file in `ls -v /docker-entrypoint.d/*.sh`
do
    echo "${0}:entry '${file}'"
    sh -c "${file}"
    if [[ "${?}" != "0" ]]; then
        exit 1;
    fi
done

fork() {
    echo "${0}:command '${command}'"
    sh -c "${command}"
}

fork &
child_pid=$!
echo "${0}:child '${child_pid}'"
wait ${child_pid}
