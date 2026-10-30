> Reference snapshot from [milvus-io/milvus-docs](https://github.com/milvus-io/milvus-docs/blob/79341af3be75a66425e5972ea26d1d9c90705fd7/site/en/getstarted/milvus_lite.md), Apache-2.0. Trailing whitespace is normalized. Relative links have been made absolute; SDK/Lite version placeholders, where present, are resolved to 3.0.2/3.2.2. See LICENSE-milvus-docs.txt.

---
id: milvus_lite.md
summary: Install Milvus Lite and run local vector search with a persistent database path.
title: Run Milvus Lite Locally
---

# Run Milvus Lite Locally

This page shows how to run local vector search with Milvus Lite. It covers installation, data persistence, filtering, and exporting data to another Milvus deployment.

## Overview

Milvus Lite is a lightweight local backend for the [Milvus Python SDK](https://github.com/milvus-io/pymilvus). Install it with the optional `milvus-lite` extra; installing `pymilvus` alone does not install this backend in the SDK version used below.

Milvus Lite is suitable for local development and small-scale workloads in environments such as:

- Jupyter Notebook or Google Colab
- Laptops
- Edge devices with compatible Python dependencies

Milvus Lite uses the `MilvusClient` API for supported operations, including vector data persistence, insert and delete, vector search, and metadata filtering. To move a supported application workflow to a remote deployment, change the connection URI and credentials, and review the differences in supported features. For large-scale production workloads, use [Milvus Standalone or Distributed](https://milvus.io/docs/install-overview.md), or fully managed Milvus on [Zilliz Cloud](https://zilliz.com/cloud).

## Prerequisites

This guide uses PyMilvus **3.0.2** and Milvus Lite **3.2.2**. Prepare the following environment:

- Python 3.10 or newer. The local Lite backend has a higher minimum Python version than the remote PyMilvus client.
- macOS, Linux, or Windows, with compatible wheels for dependencies such as `faiss-cpu` and `pyarrow`. Milvus Lite 3.2.2 is a pure-Python package, so the operating system and architecture must satisfy those dependencies rather than the Lite package itself.
- A writable local directory for database storage.

On Windows, pip skips the `milvus-lite` extra of PyMilvus 3.0.2 because of its platform marker, so `milvus-lite` must be named explicitly. The install command below already does this. For other package and platform combinations, consult the [Milvus Lite release requirements](https://github.com/milvus-io/milvus-lite/blob/v3.2.2/README.md#requirements).

## Set up Milvus Lite

Create an isolated Python environment and install both packages:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install "pymilvus[milvus-lite]==3.0.2" "milvus-lite==3.2.2"
```

Quote the extras expression so shells such as zsh do not interpret the brackets. On Windows PowerShell, activate the environment with `.venv\Scripts\Activate.ps1` instead of `source .venv/bin/activate`. The explicit versions keep the SDK and local backend aligned with this guide.

<div class="alert note">

> Milvus Lite 3.x uses a different storage engine from the original 2.x package. It cannot open an existing 2.x `.db` file in place. Keep the original database and an environment that can open it, export its data there, and import the data into a new database. Installing a new package does not migrate the old storage format. See [Migrating data from Milvus Lite](#Migrating-data-from-Milvus-Lite).

</div>

## Connect to Milvus Lite

Pass a local path ending in `.db` to `MilvusClient`:

```python
from pymilvus import MilvusClient

client = MilvusClient("./milvus_demo.db")
```

For Milvus Lite 3.2.2, this creates a **milvus_demo.db directory** in the working directory. The directory contains the database's storage files; the `.db` suffix does not mean it is a single portable file. Reuse the same path to reopen the database after closing the client or restarting the application.

Use a different path for a new database. To connect to a remote Milvus server instead, pass its endpoint and credentials:

```python
client = MilvusClient(uri="http://localhost:19530", token="username:password")
```

## Run a local search example

The following example demonstrates the API workflow with generated vectors. These vectors do not encode the meaning of the text; use an embedding model when building semantic search. Run the example against a new database path, or remove the existing `demo_collection` before running it again.

```python
from pymilvus import MilvusClient
import numpy as np

client = MilvusClient("./milvus_demo.db")
client.create_collection(
    collection_name="demo_collection",
    dimension=384  # The vectors in this example have 384 dimensions.
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

# Generate reproducible example vectors, not semantic embeddings.
rng = np.random.default_rng(7)
vectors = rng.uniform(-1, 1, size=(len(docs), 384)).tolist()
data = [
    {"id": i, "vector": vectors[i], "text": docs[i], "subject": "history"}
    for i in range(len(docs))
]
res = client.insert(collection_name="demo_collection", data=data)
print(res)

# Search only records whose subject is "history".
res = client.search(
    collection_name="demo_collection",
    data=[vectors[0]],
    filter="subject == 'history'",
    limit=2,
    output_fields=["text", "subject"],
)
print(res)

# Retrieve all records that match the scalar filter, without vector ranking.
res = client.query(
    collection_name="demo_collection",
    filter="subject == 'history'",
    output_fields=["text", "subject"],
)
print(res)

# Delete one record and keep the others for the export example below.
res = client.delete(collection_name="demo_collection", ids=[2])
print(res)
client.close()
```

For an application that generates embeddings from text, continue with [Quickstart](https://milvus.io/docs/quickstart.md). You can also explore the [Milvus Bootcamp examples](https://github.com/milvus-io/bootcamp) for RAG, image search, and framework integrations.

## Supported features and limits

Milvus Lite 3.2.2 implements a subset of Milvus operations through its local PyMilvus adapter. Its [versioned feature reference](https://github.com/milvus-io/milvus-lite/blob/v3.2.2/README.md#supported-features) describes the following capabilities:

| Area | Support in this Lite version |
|---|---|
| Dense and sparse vectors | `FLOAT_VECTOR` and `SPARSE_FLOAT_VECTOR` |
| Vector indexes | `FLAT`, `BRUTE_FORCE`, `IVF_FLAT`, `IVF_SQ8`, `HNSW`, `HNSW_SQ`, and `AUTOINDEX` |
| Scalar and sparse indexes | `INVERTED` scalar indexes and `SPARSE_INVERTED_INDEX` |
| Data operations | Insert, upsert, get, query, vector search, and delete |
| Search | Dense and sparse search, metadata filters, multiple vector fields, and hybrid search |
| Collection organization | Collections, named databases, aliases, and partitions, within the local adapter's supported operations |

This version is not limited to `FLAT` indexes. Index availability and behavior depend on the Lite version; do not apply limits from the original 2.x backend to the 3.x engine.

Review these limits before choosing Lite for an application:

- Only one process can own a database storage directory at a time. The engine protects the directory with a file lock.
- Serialize writes to the same collection. Concurrent writes are not supported safely.
- The local adapter does not implement every Milvus RPC. Unsupported operations return `UNIMPLEMENTED`; schema alteration and partition-level load or release are not available.
- Authentication, users, roles, RBAC, and TLS are not supported. Do not expose the local server to an untrusted network.
- Binary, float16, bfloat16, and int8 vector fields, and Product Quantization indexes, are not supported.
- Lite is designed for local workloads. Local API compatibility does not provide distributed scaling or the production isolation and availability of a remote deployment.

See the [versioned known limitations](https://github.com/milvus-io/milvus-lite/blob/v3.2.2/README.md#known-limitations) before relying on a server feature that the local example does not exercise.

## Migrating data from Milvus Lite

Use `milvus-lite dump` to export a collection as Milvus BulkWriter JSON files. These files can be imported into a self-hosted Milvus deployment or Zilliz Cloud.

Install the SDK's bulk writer dependencies in the environment that opens the source database:

```bash
python -m pip install "pymilvus[bulk_writer]==3.0.2"
milvus-lite dump -h
```

Close the Python application that owns the local database before running the command in another process. Export the collection from the preceding example:

```bash
milvus-lite dump -d ./milvus_demo.db -c demo_collection -p ./data_dir
```

The command reads `demo_collection` from the **milvus_demo.db storage directory** and writes export files under **data_dir**. Import those files with [Bulk Insert](https://milvus.io/docs/import-data.md) or [Zilliz Cloud Data Import](https://docs.zilliz.com/docs/data-import).

<div class="alert note">

> To export an original 2.x database file, run the dump tool in an environment with the original Lite version that can open that file. The 3.x dump tool does not convert the old storage format by opening it directly. Preserve the source database until you have verified the imported row count and search results.

</div>

For supported dump options and storage-format restrictions, see the [Milvus Lite export reference](https://github.com/milvus-io/milvus-lite/blob/v3.2.2/README.md#dump-data).

## What's next

Continue with these tasks:

- [Quickstart](https://milvus.io/docs/quickstart.md): generate embeddings and run a search workflow.
- [Single-Vector Search](https://milvus.io/docs/single-vector-search.md) and [Hybrid Search](https://milvus.io/docs/multi-vector-search.md): design queries for your application.
- [Choose a deployment](https://milvus.io/docs/install-overview.md): move beyond local development.
- [Attu](https://github.com/zilliztech/attu): explore the Milvus GUI for a remote deployment.
