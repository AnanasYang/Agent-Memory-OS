#!/bin/bash
export NETLIFY_AUTH_TOKEN=nfp_967YWmBytLb363Eb7dMa5L5uRtoN6oAU5977
export NETLIFY_SITE_ID=251a9db1-9f57-4efa-9c19-1db1607cbdba
netlify deploy --prod --dir=. --auth "$NETLIFY_AUTH_TOKEN"
