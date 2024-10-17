# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2019 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Test file signals."""

from io import BytesIO

from flask import url_for
from .testutils import login_user

from invenio_files_rest.signals import file_deleted, file_uploaded
from unittest.mock import patch


def test_signals(app, client, headers, bucket, permissions):
    """Test file_uploaded and file_deleted signals."""
    with patch("invenio_files_rest.views.db.session.remove"):
        login_user(client, permissions["bucket"])
        key = "myfile.txt"
        # key = "test.txt"
        data = b"content of my file"
        object_url = url_for("invenio_files_rest.object_api", bucket_id=bucket.id, key=key)

        calls = []

        def upload_listener(sender, obj=None):
            calls.append("file-uploaded")

        def delete_listener(sender, obj=None):
            calls.append("file-deleted")
        print(666666666666)
        print(upload_listener)
        print(555555555)
        print(delete_listener)
        file_uploaded.connect(upload_listener, weak=False)
        file_deleted.connect(delete_listener, weak=False)
        print(44444)
        print(file_uploaded)
        print(file_deleted)
        try:
            client.put(
                object_url,
                input_stream=BytesIO(data),
                headers={"Content-Type": "application/octet-stream"},
            )
            # client.delete(object_url)
            print(9999)
            print(client)
            print(bucket)
            print(object_url)
            client.delete(object_url)
            assert calls == ["file-uploaded", "file-deleted"]
        finally:
            file_uploaded.disconnect(upload_listener)
            file_deleted.disconnect(delete_listener)
