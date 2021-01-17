---
title: "How to fix TypeError: Cannot read property 'subscribe' of undefined"
description: A solution for Angular tests when they fail with "Cannot read property 'subscribe' of undefined"
sidebar_label: Read property of undefined
---

This issue means that something has been replaced with a mock object and returns a dummy result (`undefined`) instead of observable streams.

There is an answer for this error in the section called [How to mock observables](../extra/mock-observables.md),
if the error has been triggered by a mock service, and its property is of type of `undefined`.

Or you might check [`MockInstance`](../api/MockInstance.md) or [`ngMocks.defaultMock`](../api/ngMocks/defaultMock.md)
in the case if the error has been caused by a mock component or a mock directive.
