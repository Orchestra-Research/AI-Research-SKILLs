> Reference snapshot from [milvus-io/milvus-docs](https://github.com/milvus-io/milvus-docs/blob/79341af3be75a66425e5972ea26d1d9c90705fd7/site/en/userGuide/schema/primary-field.md), Apache-2.0. Trailing whitespace is normalized. Relative links have been made absolute; SDK/Lite version placeholders, where present, are resolved to 3.0.2/3.2.2. See LICENSE-milvus-docs.txt.

---
id: primary-field.md
title: "Primary Field & AutoID"
summary: "Every collection in Milvus must have a primary field to uniquely identify each entity. This field ensures that every entity can be inserted, updated, queried, or deleted without ambiguity."
---

# Primary Field & AutoID

Every collection in Milvus must have a primary field to uniquely identify each entity. This field ensures that every entity can be inserted, updated, queried, or deleted without ambiguity.

Depending on your use case, you can either let Milvus automatically generate IDs (AutoID) or assign your own IDs manually.

## What is a primary field?

A primary field acts as the unique key for each entity in a collection, similar to a primary key in a traditional database. Milvus uses the primary field to manage entities during insert, upsert, delete, and query operations.

Key requirements:

- Each collection must have **exactly one** primary field.

- Primary field values cannot be null.

- The data type must be specified at creation and cannot be changed later.

## Supported data types

The primary field must use a supported scalar data type that can uniquely identify entities.

<table>
   <tr>
     <th><p>Data Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>INT64</code></p></td>
     <td><p>64-bit integer type, commonly used with AutoID. This is the recommended option for most use cases.</p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Variable-length string type. Use this when entity identifiers come from external systems (for example, product codes or user IDs). Requires the <code>max_length</code> property to define the maximum number of bytes allowed per value.</p></td>
   </tr>
</table>

## Choose between AutoID and Manual IDs

Milvus supports two modes for assigning primary key values.

<table>
   <tr>
     <th><p>Mode</p></th>
     <th><p>Description</p></th>
     <th><p>Recommended For</p></th>
   </tr>
   <tr>
     <td><p>AutoID</p></td>
     <td><p>Milvus automatically generates unique identifiers for inserted or imported entities.</p></td>
     <td><p>Most scenarios where you don’t need to manage IDs manually.</p></td>
   </tr>
   <tr>
     <td><p>Manual ID</p></td>
     <td><p>You provide unique IDs yourself when inserting or importing data.</p></td>
     <td><p>When IDs must align with external systems or pre-existing datasets.</p></td>
   </tr>
</table>

<div class="alert note">

- If you are unsure which mode to choose, [start with AutoID](https://milvus.io/docs/primary-field.md#Quickstart-Use-AutoID) for simpler ingestion and guaranteed uniqueness.

- You are advised to rely on `autoId` in all cases unless manually setting primary keys is beneficial.

</div>

## Quickstart: Use AutoID

You can let Milvus handle ID generation automatically.

### Step 1: Create a collection with AutoID

Enable `auto_id=True` in your primary field definition. Milvus will handle ID generation automatically.

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#java">Java</a>
    <a href="#javascript">NodeJS</a>
    <a href="#go">Go</a>
    <a href="#bash">cURL</a>
</div>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="http://localhost:19530")

schema = client.create_schema()

# Define primary field with AutoID enabled
# highlight-start
schema.add_field(
    field_name="id", # Primary field name
    is_primary=True,
    auto_id=True,  # Milvus generates IDs automatically; Defaults to False
    datatype=DataType.INT64
)
# highlight-end

# Define the other fields
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # Vector field
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # Scalar field of the VARCHAR type

# Create the collection
if client.has_collection("demo_autoid"):
    client.drop_collection("demo_autoid")
client.create_collection(collection_name="demo_autoid", schema=schema)
```

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("http://localhost:19530")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_autoid")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_autoid")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "localhost:19530",
});

// Define schema fields
const schema = [
  {
    name: "id",
    description: "Primary field",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true, // Milvus generates IDs automatically
  },
  {
    name: "embedding",
    description: "Vector field",
    data_type: DataType.FloatVector,
    dim: 4,
  },
  {
    name: "category",
    description: "Scalar field",
    data_type: DataType.VarChar,
    max_length: 1000,
  },
];

// Create the collection
await client.createCollection({
  collection_name: "demo_autoid",
  fields: schema,
});

```

```go
// go
```

```bash
# restful
export SCHEMA='{
    "autoID": true,
    "fields": [
        {
            "fieldName": "id",
            "dataType": "Int64",
            "isPrimary": true,
            "elementTypeParams": {}
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'http://localhost:19530/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-H 'Request-Timeout: 10' \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"schema\": $SCHEMA
}"
```

### Step 2: Insert Data

**Important:** Do not include the primary field column in your data. Milvus generates IDs automatically.

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#java">Java</a>
    <a href="#javascript">NodeJS</a>
    <a href="#go">Go</a>
    <a href="#bash">cURL</a>
</div>

```python
data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_autoid", data=data)
print("Generated IDs:", res.get("ids"))

# Output example:
# Generated IDs: [461526052788333649, 461526052788333650]
```

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_autoid")
        .data(rows)
        .build());
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
```

```javascript
const data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const res = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(res);
```

```go
// go
```

```bash
# restful
export INSERT_DATA='[
    {
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

curl -X POST 'http://localhost:19530/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-H 'Request-Timeout: 10' \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"data\": $INSERT_DATA
}"
```

<div class="alert note">

Use `upsert()` instead of `insert()` when working with existing entities to avoid duplicate ID errors.

</div>

## Use manual IDs

If you need to control IDs manually, disable AutoID and provide your own values.

### Step 1: Create a collection without AutoID

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#java">Java</a>
    <a href="#javascript">NodeJS</a>
    <a href="#go">Go</a>
    <a href="#bash">cURL</a>
</div>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="http://localhost:19530")

schema = client.create_schema()

# Define the primary field without AutoID
# highlight-start
schema.add_field(
    field_name="product_id",
    is_primary=True,
    auto_id=False,  # You'll provide IDs manually at data ingestion
    datatype=DataType.VARCHAR,
    max_length=100 # Required when datatype is VARCHAR
)
# highlight-end

# Define the other fields
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # Vector field
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # Scalar field of the VARCHAR type

# Create the collection
if client.has_collection("demo_manual_ids"):
    client.drop_collection("demo_manual_ids")
client.create_collection(collection_name="demo_manual_ids", schema=schema)
```

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("http://localhost:19530")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(false)
        .maxLength(100)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

```javascript

import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "localhost:19530",
  username: "username",
  password: "Aa12345!!",
});

const schema = [
  {
    name: "product_id",
    data_type: DataType.VARCHAR,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: "embedding",
    data_type: DataType.FLOAT_VECTOR,
    dim: 4,
  },
  {
    name: "category",
    data_type: DataType.VARCHAR,
    max_length: 1000,
  },
];

const res = await client.createCollection({
  collection_name: "demo_autoid",
  schema: schema,
});

```

```go
// go
```

```bash
# restful
export SCHEMA='{
    "autoID": false,
    "fields": [
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "isPrimary": true,
            "elementTypeParams": {
                "max_length": "100"
            }
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'http://localhost:19530/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-H 'Request-Timeout: 10' \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"schema\": $SCHEMA
}"
```

### Step 2: Insert data with your IDs

You must include the primary field column in every insert operation.

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#java">Java</a>
    <a href="#javascript">NodeJS</a>
    <a href="#go">Go</a>
    <a href="#bash">cURL</a>
</div>

```python
# Each entity must contain the primary field `product_id`
data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_manual_ids", data=data)
print("Generated IDs:", res.get("ids"))

# Output example:
# Generated IDs: ['PROD-001', 'PROD-002']
```

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.addProperty("product_id", "PROD-001");
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.addProperty("product_id", "PROD-002");
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_manual_ids")
        .data(rows)
        .build());
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
```

```javascript

const data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const insert = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(insert);
```

```go
// go
```

```bash
# restful
export INSERT_DATA='[
    {
        "product_id": "PROD-001",
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "product_id": "PROD-002",
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

# 插入数据
curl -X POST 'http://localhost:19530/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-H 'Request-Timeout: 10' \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"data\": $INSERT_DATA
}"
```

Your responsibilities:

- Ensure all IDs are unique across all entities

- Include the primary field in every insert/import operation

- Handle ID conflicts and duplicate detection yourself

## Advanced usage

### Migrate data with existing AutoIDs

To preserve existing IDs during data migration, enable the `allow_insert_auto_id` property by making the `alter_collection_properties` call. When set to true, Milvus accepts user-provided IDs even if AutoID is enabled.

For configuration details, refer to [Modify Collection](https://milvus.io/docs/modify-collection.md#Example-5-Enable-allowinsertautoid).

### Ensure global AutoID uniqueness across clusters

When running multiple Milvus clusters, configure a unique cluster ID for each to ensure AutoIDs never overlap.

**Configuration:** Edit the `common.clusterID` config in `milvus.yaml` before initializing your cluster:

```yaml
common:
  clusterID: 3   # Must be unique across all clusters (Range: 0-7)
```

In this config, `clusterID` specifies the unique identifier used in AutoID generation, ranging from 0 to 7 (supports up to eight clusters).

<div class="alert note">

Milvus handles bit-reversal internally to enable future expansion without ID overlap. No manual configuration needed beyond setting the cluster ID.

</div>

## Reference: How AutoID works

Understanding how AutoID generates unique identifiers internally can help you [configure cluster IDs](https://milvus.io/docs/primary-field.md#Ensure-global-AutoID-uniqueness-across-clusters) correctly and troubleshoot ID-related issues.

AutoID uses a structured 64-bit format to guarantee uniqueness:

```plaintext
[sign_bit][cluster_id][physical_ts][logical_ts]
```

<table>
   <tr>
     <th><p>Segment</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>sign_bit</code></p></td>
     <td><p>Reserved for internal use</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>Identifies which cluster generated the ID (value range: 0-7)</p></td>
   </tr>
   <tr>
     <td><p><code>physical_ts</code></p></td>
     <td><p>Timestamp in milliseconds when the ID was generated</p></td>
   </tr>
   <tr>
     <td><p><code>logical_ts</code></p></td>
     <td><p>Counter to distinguish IDs created in the same millisecond</p></td>
   </tr>
</table>

<div class="alert note">

Even when AutoID is enabled with `VARCHAR` as the data type, Milvus still generates numeric IDs. These are stored as numeric strings with a maximum length of 20 characters (uint64 range).

</div>
