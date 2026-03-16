# Biomedical & Pharmaceutical ML Reference

Models, architectures, and training patterns specific to biomedical and pharmaceutical domains.
Referenced from SKILL.md.

## Table of Contents

1. [Molecular Property Prediction & Drug Discovery](#molecular-property-prediction--drug-discovery)
2. [Molecular Generation](#molecular-generation)
3. [Protein Structure & Language Models](#protein-structure--language-models)
4. [Drug-Target Interaction](#drug-target-interaction)
5. [Medical Imaging](#medical-imaging)
6. [Genomic & Sequence Models](#genomic--sequence-models)
7. [Single-Cell Omics](#single-cell-omics)
8. [Clinical NLP](#clinical-nlp)
9. [EHR & Survival Analysis](#ehr--survival-analysis)
10. [Biomedical Training Tricks](#biomedical-training-tricks)

---

## Molecular Property Prediction & Drug Discovery

### Graph Neural Networks for molecules

Molecules are naturally graphs (atoms = nodes, bonds = edges). GNNs are the dominant architecture.

| Model | Key Idea | Best For |
|-------|----------|----------|
| **SchNet** | Continuous filter convolutions on 3D coordinates | Small molecules, QM properties |
| **DimeNet / DimeNet++** | Directional message passing (angles between bonds) | Geometry-sensitive properties |
| **GemNet** | Triplet interactions + geometric embeddings | State-of-art on OC20 catalyst dataset |
| **MPNN** (Gilmer et al.) | General message passing framework | Baseline for molecular graphs |
| **AttentiveFP** | Graph attention for molecular fingerprints | ADMET prediction |

### Molecular fingerprints + transformers

| Model | Approach | Use Case |
|-------|----------|----------|
| **MolBERT** | BERT pretrained on SMILES strings | Molecular property prediction |
| **ChemBERTa** | RoBERTa on SMILES | Transfer learning for chemistry |
| **Uni-Mol** | 3D molecular representation learning | Broad molecular tasks |
| **MoLFormer** | Large-scale SMILES transformer | Virtual screening |

### Practical setup for molecular GNNs

```python
from torch_geometric.data import Data, DataLoader
from torch_geometric.nn import GCNConv, global_mean_pool

class MolGNN(nn.Module):
    def __init__(self, in_feats, hidden, out_feats, n_layers=3):
        super().__init__()
        self.convs = nn.ModuleList()
        self.convs.append(GCNConv(in_feats, hidden))
        for _ in range(n_layers - 1):
            self.convs.append(GCNConv(hidden, hidden))
        self.head = nn.Linear(hidden, out_feats)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        for conv in self.convs:
            x = F.relu(conv(x, edge_index))
        x = global_mean_pool(x, batch)  # graph-level readout
        return self.head(x)
```

**Key libraries**: PyTorch Geometric, DGL, RDKit (featurization), DeepChem

### ADMET prediction

Absorption, Distribution, Metabolism, Excretion, Toxicity — critical for drug candidates:
- Use MoleculeNet benchmarks for evaluation (BBBP, BACE, ClinTox, Tox21, HIV, SIDER)
- Multi-task learning across ADMET endpoints often outperforms single-task
- Scaffold splitting (not random) for realistic evaluation — prevents data leakage from similar molecules

---

## Molecular Generation

### String-based (SMILES)

| Model | Approach | Strength |
|-------|----------|----------|
| **REINVENT** | RNN + reinforcement learning | Optimizes for desired properties |
| **SMILES VAE** | Variational autoencoder on SMILES | Latent space interpolation |
| **MolGPT** | GPT-style autoregressive on SMILES | Conditional generation |

### Graph-based

| Model | Approach | Strength |
|-------|----------|----------|
| **JT-VAE** | Junction tree variational autoencoder | Guarantees valid molecules |
| **GraphAF** | Autoregressive flow on graphs | Flexible, sequential generation |
| **MoFlow** | Normalizing flows for molecules | Invertible, exact likelihood |

### 3D structure-aware generation

| Model | Approach | Use Case |
|-------|----------|----------|
| **EDM** (Hoogeboom et al.) | Equivariant diffusion in 3D | Generate 3D conformers |
| **DiffSBDD** | Diffusion for structure-based drug design | Protein pocket → ligand |
| **TargetDiff** | SE(3)-equivariant diffusion | Target-aware molecule generation |

### Retrosynthesis

Predict how to synthesize a target molecule (work backward from product to reactants):
- **Template-based**: classify reaction templates (fast, limited coverage)
- **Template-free**: seq2seq translation from product SMILES to reactant SMILES
- **Key models**: Molecular Transformer, LocalRetro, Graph2SMILES

---

## Protein Structure & Language Models

### Structure prediction

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| **AlphaFold2** | MSA + sequence | 3D structure | Revolutionary accuracy; needs MSA database search |
| **AlphaFold3** | Sequence(s) + ligands | Complex structure | Handles protein-ligand, protein-DNA/RNA complexes |
| **ESMFold** | Single sequence (no MSA) | 3D structure | Much faster; ESM-2 embeddings → structure |
| **RoseTTAFold** | MSA + templates | 3D structure | Three-track architecture, open-source |
| **OpenFold** | Same as AF2 | 3D structure | Open-source reimplementation of AlphaFold2 |

### Protein language models

Pretrained on millions of protein sequences — learn evolutionary and structural features:

| Model | Size | Pretraining | Best For |
|-------|------|-------------|----------|
| **ESM-2** | 8M-15B params | Masked language modeling on UniRef | General protein tasks, structure prediction |
| **ProtTrans** (ProtBERT, ProtT5) | Up to 3B | MLM/denoising on UniRef/BFD | Sequence classification, function prediction |
| **ProGen2** | Up to 6.4B | Autoregressive on protein sequences | Protein design and generation |

```python
# Using ESM-2 for protein embeddings
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("facebook/esm2_t33_650M_UR50D")
tokenizer = AutoTokenizer.from_pretrained("facebook/esm2_t33_650M_UR50D")

inputs = tokenizer("MKTAYIAKQRQISFVK", return_tensors="pt")
outputs = model(**inputs)
embeddings = outputs.last_hidden_state  # per-residue embeddings
```

### Fine-tuning protein LMs

- **Contact prediction**: predict which residue pairs are close in 3D
- **Function annotation**: GO term prediction from embeddings
- **Fitness prediction**: mutant → wild-type fitness (DMS data)
- **Subcellular localization**: where in the cell the protein goes

Use per-residue embeddings for residue-level tasks, mean-pooled for protein-level tasks.

---

## Drug-Target Interaction

Predict whether a drug molecule binds to a protein target:

| Model | Drug Rep | Target Rep | Notes |
|-------|----------|------------|-------|
| **DeepDTA** | SMILES CNN | Protein sequence CNN | Simple baseline |
| **GraphDTA** | Molecular graph GNN | Protein sequence CNN | Better than DeepDTA |
| **DrugBAN** | Graph + bilinear attention | Protein sequence | State-of-art on benchmark |
| **MolTrans** | Molecular substructure | Protein subsequence | Interaction-aware transformer |

### Virtual screening pipeline

1. **Target**: protein structure (from AlphaFold or PDB)
2. **Library**: millions of candidate molecules (ZINC, Enamine REAL)
3. **Docking**: quick physics-based filter (AutoDock Vina, Glide)
4. **ML scoring**: GNN/transformer re-ranking of top candidates
5. **ADMET filter**: predict toxicity, solubility, permeability
6. **Synthesis check**: retrosynthesis feasibility

---

## Medical Imaging

### Architectures by task

| Task | Architecture | Notes |
|------|-------------|-------|
| **Classification** | ViT or EfficientNet (pretrained) | Fine-tune from ImageNet or medical-specific pretraining |
| **Segmentation** | U-Net / nnU-Net | nnU-Net auto-configures for each dataset |
| **3D segmentation** | Swin-UNETR / V-Net / 3D U-Net | For CT/MRI volumes |
| **Detection** | DETR / Faster R-CNN | Lesion detection, cell counting |
| **Foundation model** | MedSAM / BiomedCLIP | Zero/few-shot adaptation |

### nnU-Net (self-configuring segmentation)

nnU-Net automatically configures architecture, preprocessing, and training for any medical segmentation task:

```bash
# nnU-Net auto-configures everything
nnUNetv2_plan_and_preprocess -d DATASET_ID --verify_dataset_integrity
nnUNetv2_train DATASET_ID 3d_fullres FOLD
nnUNetv2_predict -i INPUT_FOLDER -o OUTPUT_FOLDER -d DATASET_ID -c 3d_fullres
```

Key decisions nnU-Net makes automatically:
- 2D vs 3D vs cascade architecture
- Patch size, batch size based on GPU memory
- Preprocessing (resampling, normalization per modality)
- Augmentation (rotation, scaling, mirroring, elastic deformation)
- Postprocessing (connected components, etc.)

### Medical imaging training patterns

```python
# Common medical image preprocessing
import monai.transforms as mt

train_transforms = mt.Compose([
    mt.LoadImaged(keys=["image", "label"]),
    mt.EnsureChannelFirstd(keys=["image", "label"]),
    mt.Spacingd(keys=["image", "label"], pixdim=(1.0, 1.0, 1.0)),  # isotropic
    mt.ScaleIntensityRanged(keys=["image"], a_min=-175, a_max=250,
                            b_min=0.0, b_max=1.0, clip=True),  # CT window
    mt.CropForegroundd(keys=["image", "label"], source_key="image"),
    mt.RandCropByPosNegLabeld(
        keys=["image", "label"], label_key="label",
        spatial_size=(96, 96, 96), pos=1, neg=1, num_samples=4),
    mt.RandFlipd(keys=["image", "label"], prob=0.5, spatial_axis=0),
    mt.RandRotate90d(keys=["image", "label"], prob=0.5),
])
```

### Loss functions for medical segmentation

```python
# Dice + Cross-Entropy (standard for medical segmentation)
from monai.losses import DiceCELoss
loss_fn = DiceCELoss(to_onehot_y=True, softmax=True)

# For highly imbalanced segmentation (tiny lesions)
from monai.losses import FocalLoss, TverskyLoss
loss_fn = TverskyLoss(alpha=0.3, beta=0.7)  # penalize FN more than FP
```

### Key libraries
- **MONAI** — PyTorch framework for medical imaging (transforms, losses, networks, metrics)
- **TorchIO** — data loading and augmentation for 3D medical images
- **nnU-Net** — self-configuring segmentation
- **MedPy** — medical image processing utilities

---

## Genomic & Sequence Models

### DNA/RNA language models

| Model | Architecture | Sequence Length | Best For |
|-------|-------------|----------------|----------|
| **DNABERT-2** | BERT with BPE tokenization | 512-4K | Short regulatory sequences, promoters |
| **HyenaDNA** | Hyena (long-range SSM) | Up to 1M bp | Long-range regulatory elements, whole genes |
| **Evo** | StripedHyena | Up to 131K bp | DNA/RNA generation, fitness prediction |
| **Enformer** | Transformer | 200K bp input | Gene expression prediction from sequence |
| **Nucleotide Transformer** | BERT-style | 6K tokens | Variant effect prediction |
| **Caduceus** | Bidirectional Mamba | Up to 131K bp | Complements Evo; bidirectional |

### Enformer for gene expression

```python
# Enformer predicts gene expression tracks from 200kb DNA sequence
# Output: 896 spatial bins × 5,313 tracks (CAGE, DNase, histone marks)
# Architecture: convolutional stem → 11 transformer layers → prediction heads
#
# Key insight: long-range enhancer-promoter interactions require >100kb context
# which is why Enformer uses 200kb input windows
```

### Variant effect prediction

Predict whether a DNA/protein variant is pathogenic:
- **ESM-1v**: zero-shot variant effect from protein LM log-likelihood ratios
- **AlphaMissense**: AlphaFold-derived pathogenicity predictions
- **CADD / SpliceAI**: established tools for genomic variant scoring
- Fine-tune DNABERT or HyenaDNA on ClinVar for custom variant classifiers

---

## Single-Cell Omics

### Foundation models for single-cell

| Model | Architecture | Training Data | Use Case |
|-------|-------------|---------------|----------|
| **scVI** | VAE | Per-dataset | Batch correction, normalization, imputation |
| **scGPT** | GPT-style autoregressive | 33M cells | Cell annotation, perturbation prediction, integration |
| **Geneformer** | BERT-style (rank-ordered genes) | 30M cells | Transfer learning for gene network analysis |
| **scFoundation** | Transformer | 50M cells | General single-cell foundation model |

### scVI setup

```python
import scvi

# Register the AnnData object
scvi.model.SCVI.setup_anndata(adata, layer="counts", batch_key="batch")

# Train the model
model = scvi.model.SCVI(adata, n_latent=30, n_layers=2)
model.train(max_epochs=200, early_stopping=True)

# Get latent representation (for clustering, visualization)
latent = model.get_latent_representation()
adata.obsm["X_scVI"] = latent

# Get normalized, batch-corrected expression
adata.layers["scvi_normalized"] = model.get_normalized_expression()
```

### Key considerations for single-cell ML

- **Sparsity**: scRNA-seq matrices are ~90-95% zeros — use sparse representations
- **Batch effects**: biggest confounder; always include batch correction (scVI, Harmony, Scanorama)
- **Gene selection**: highly variable genes (HVGs) — typically 2000-5000 genes for downstream analysis
- **Preprocessing**: log1p normalization, or use raw counts with models that handle them (scVI)
- **Evaluation**: silhouette score (bio conservation vs batch mixing), LISI scores, kBET

---

## Clinical NLP

### Biomedical language models

| Model | Base | Pretraining Corpus | Best For |
|-------|------|-------------------|----------|
| **PubMedBERT** | BERT | PubMed abstracts (from scratch) | Biomedical NER, relation extraction |
| **BioBERT** | BERT | PubMed + PMC (continued pretraining) | General biomedical NLP |
| **BioGPT** | GPT-2 | PubMed abstracts | Biomedical text generation |
| **GatorTron** | BERT (large) | Clinical notes + PubMed (90B words) | Clinical NLP, de-identified EHR |
| **Med-PaLM 2** | PaLM 2 | Medical QA fine-tuning | Medical question answering |
| **BioMistral** | Mistral-7B | PubMed continued pretraining | Open-source biomedical LLM |

### Clinical NLP tasks

- **Named Entity Recognition (NER)**: extract drugs, diseases, genes, procedures from text
- **Relation Extraction**: drug-drug interactions, gene-disease associations
- **Medical coding**: ICD-10, SNOMED-CT, MeSH term assignment
- **De-identification**: remove PHI from clinical notes (HIPAA compliance)
- **Clinical trial matching**: patient → eligible trials

### Practical pattern

```python
from transformers import AutoModelForTokenClassification, AutoTokenizer

# PubMedBERT for biomedical NER
model = AutoModelForTokenClassification.from_pretrained(
    "microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext",
    num_labels=num_entity_types
)

# Fine-tune on domain-specific NER dataset (BC5CDR, NCBI-disease, etc.)
# Use BIO tagging scheme
# Typical hyperparameters:
#   lr: 2e-5, epochs: 20, batch_size: 16, warmup: 10%
```

---

## EHR & Survival Analysis

### EHR modeling

Electronic Health Records are sequential, multimodal, and irregularly sampled:

| Approach | Architecture | Key Idea |
|----------|-------------|----------|
| **BEHRT** | BERT on medical codes | Treat visits as "sentences", codes as "tokens" |
| **Med-BERT** | BERT with structured EHR | Pretrain on diagnosis codes for disease prediction |
| **RETAIN** | Reverse-time attention RNN | Interpretable predictions from visit sequences |
| **STraTS** | Self-supervised transformer | Handles irregular time intervals |

### Survival analysis (time-to-event)

```python
# Cox proportional hazards with neural network
# Loss: negative partial log-likelihood
def cox_ph_loss(risk_scores, events, times):
    """
    risk_scores: model output (higher = higher risk)
    events: 1 if event occurred, 0 if censored
    times: time to event or censoring
    """
    order = torch.argsort(times, descending=True)
    risk_scores = risk_scores[order]
    events = events[order]

    log_risk = torch.logcumsumexp(risk_scores, dim=0)
    loss = -torch.mean((risk_scores - log_risk) * events)
    return loss

# Evaluation metric: concordance index (C-index)
# C-index > 0.7 is decent, > 0.8 is good for clinical prediction
```

### DeepSurv / DeepHit

- **DeepSurv**: neural network + Cox PH (continuous time, proportional hazards assumption)
- **DeepHit**: directly predicts discrete time survival distribution (no PH assumption)
- **Key advantage**: can model complex nonlinear covariate interactions that Cox can't

---

## Biomedical Training Tricks

### Small dataset strategies (most biomedical datasets are small)

1. **Domain-specific pretraining** — always start from a biomedical pretrained model, not generic ImageNet/BERT
2. **Transfer learning pipeline**: generic pretrained → domain pretrained → task fine-tuned
3. **Data augmentation**: aggressive but domain-appropriate (see safety notes below)
4. **Few-shot learning**: prototypical networks, MAML for rare disease classification
5. **Self-supervised pretraining** on unlabeled biomedical data, then fine-tune on labeled
6. **Multi-task learning**: train on multiple related endpoints simultaneously
7. **Cross-validation**: k-fold (k=5-10) is mandatory for small biomedical datasets; a single train/val/test split is unreliable

### Class imbalance (very common in biomedical)

```python
# Strategy 1: Weighted loss
class_counts = torch.tensor([1000, 50, 30])  # healthy, disease_A, disease_B
weights = 1.0 / class_counts
weights = weights / weights.sum() * len(weights)
loss_fn = nn.CrossEntropyLoss(weight=weights)

# Strategy 2: Focal loss (for extreme imbalance)
def focal_loss(logits, targets, gamma=2.0, alpha=0.25):
    ce = F.cross_entropy(logits, targets, reduction='none')
    pt = torch.exp(-ce)
    return (alpha * (1 - pt) ** gamma * ce).mean()

# Strategy 3: Oversampling with WeightedRandomSampler
from torch.utils.data import WeightedRandomSampler
sample_weights = [weights[label] for label in labels]
sampler = WeightedRandomSampler(sample_weights, num_samples=len(labels))
```

### Medical image augmentation safety

Some standard augmentations are **unsafe** for medical images:

| Augmentation | Safe? | Notes |
|-------------|-------|-------|
| Horizontal flip | **Depends** | Safe for dermoscopy, unsafe for chest X-ray (heart laterality matters) |
| Vertical flip | **Usually no** | Anatomy has orientation |
| Random crop | **Yes** | With care for lesion location |
| Color jitter | **Sometimes** | Safe for natural images, problematic for stained histology |
| Elastic deformation | **Yes** | Mimics tissue deformation, widely used in medical segmentation |
| Intensity scaling | **Yes** | Mimics scanner variation |
| Mixup/CutMix | **Caution** | Can create anatomically impossible combinations |
| Rotation | **Small angles** | ±15° usually safe; 90°/180° depends on modality |

### Regulatory considerations (FDA / EMA)

When building models for clinical deployment:
- **Locked algorithm**: model weights cannot change after regulatory submission
- **Predetermined change control plan**: document how the model can be updated
- **Dataset documentation**: detailed provenance, demographics, inclusion/exclusion criteria
- **Performance by subgroup**: report metrics stratified by age, sex, ethnicity, disease severity
- **Failure mode analysis**: characterize where the model fails and how gracefully
- **Intended use statement**: narrow, specific clinical context
- **Validation**: external validation on data from a different institution is expected

### Domain-specific pretraining sources

| Domain | Pretraining Data | Scale |
|--------|-----------------|-------|
| **Molecular** | PubChem, ZINC, ChEMBL | 100M+ molecules |
| **Protein** | UniRef50/90, UniProt, BFD | 250M+ sequences |
| **Genomic** | Human reference genome, 1000 Genomes | ~3B bp per genome |
| **Medical imaging** | MIMIC-CXR, CheXpert, NIH ChestX-ray14 | 200K-400K images |
| **Clinical text** | MIMIC-III/IV clinical notes | 2M+ notes |
| **Biomedical text** | PubMed, PMC full text | 36M+ abstracts |
| **Single-cell** | CellxGene, HCA | 50M+ cells |

### Key biomedical ML libraries

| Library | Purpose |
|---------|---------|
| **PyTorch Geometric** | GNNs for molecules and graphs |
| **DGL** | Alternative GNN framework |
| **RDKit** | Molecular featurization, SMILES processing |
| **DeepChem** | Molecular ML models and datasets |
| **MONAI** | Medical imaging (transforms, losses, architectures) |
| **TorchIO** | 3D medical image augmentation and loading |
| **scanpy / scverse** | Single-cell analysis ecosystem |
| **scvi-tools** | Deep learning for single-cell |
| **Biopython** | Sequence parsing, alignment, PDB handling |
| **HuggingFace transformers** | Biomedical LMs (PubMedBERT, ESM-2) |
| **OpenFold** | Protein structure prediction |
| **lifelines** | Survival analysis (Cox PH, Kaplan-Meier) |
| **pysurv / auton-survival** | Neural survival models |
