# Backend Scripts

This directory contains utility scripts for managing the Bharat Sahayak backend.

## Scheme Data Seeding Script

### Overview

`seed_schemes.py` populates the DynamoDB table with 12 major Indian government welfare schemes including:

1. PM-KISAN - Agricultural income support
2. MGNREGA - Rural employment guarantee
3. Ayushman Bharat - Health insurance
4. PMAY - Housing for all
5. PMUY - Free LPG connections
6. APY - Pension scheme
7. PMFBY - Crop insurance
8. NSAP - Old age pension
9. PMMY - Micro finance loans
10. Beti Bachao Beti Padhao - Girl child welfare
11. PMKVY - Skill development training
12. Stand Up India - SC/ST/Women entrepreneurship

### Prerequisites

- Python 3.12+
- AWS credentials configured
- DynamoDB table created (via SAM deployment)
- Required Python packages: boto3, pydantic

### Usage

#### Local Development

```bash
# Set environment variable for table name
export DYNAMODB_TABLE=bharat-sahayak-data-dev

# Run the seeding script
python backend/scripts/seed_schemes.py
```

#### Production

```bash
# Set environment variable for production table
export DYNAMODB_TABLE=bharat-sahayak-data-prod

# Run the seeding script
python backend/scripts/seed_schemes.py
```

#### Using AWS CLI Profile

```bash
# Use specific AWS profile
AWS_PROFILE=your-profile python backend/scripts/seed_schemes.py
```

### Script Features

- **Batch Writing**: Efficiently writes schemes in batches of 25 items
- **Data Validation**: Uses Pydantic models to ensure data integrity
- **Verification**: Automatically verifies seeded data after insertion
- **Multilingual Support**: Includes translations for scheme names in 11 Indian languages
- **Comprehensive Metadata**: Each scheme includes:
  - Name and translations
  - Description
  - Category
  - Target audience
  - Benefits
  - Eligibility rules (as lambda expressions)
  - Application steps
  - Required documents
  - Official website

### DynamoDB Structure

Each scheme is stored with:
- **PK**: `SCHEME#<scheme-id>`
- **SK**: `METADATA`
- **Attributes**: All scheme metadata including eligibility rules

### Eligibility Rules

Eligibility rules are stored as Python lambda expressions that can be evaluated at runtime:

```python
EligibilityRule(
    criterion='Age Requirement',
    type='numeric',
    requirement='Must be 18 years or above',
    evaluator="lambda u: u.get('age', 0) >= 18"
)
```

### Output

The script provides detailed output:
```
============================================================
Bharat Sahayak - Government Scheme Data Seeding Script
============================================================

Connected to DynamoDB table: bharat-sahayak-data-dev

Preparing to seed 12 schemes...
✓ Seeded scheme: PM-KISAN (pm-kisan)
✓ Seeded scheme: MGNREGA (mgnrega)
...

✅ Successfully seeded 12 schemes to DynamoDB!

Verifying seeded data...
Found 12 schemes in database:
  - PM-KISAN (pm-kisan) - Category: agriculture
  - MGNREGA (mgnrega) - Category: employment
  ...

✅ Verification successful! All 12 schemes seeded correctly.
```

### Error Handling

The script includes comprehensive error handling:
- Connection errors to DynamoDB
- Data validation errors
- Batch write failures
- Verification mismatches

### Updating Schemes

To update existing schemes:
1. Modify the scheme data in `get_government_schemes()`
2. Increment the `version` field
3. Run the script again (it will overwrite existing items)

### Adding New Schemes

To add new schemes:
1. Add a new `Scheme` object to the `schemes` list in `get_government_schemes()`
2. Follow the existing pattern for structure
3. Include all required fields
4. Add translations for at least Hindi and Tamil
5. Define eligibility rules as lambda expressions
6. Run the script to seed the new scheme
