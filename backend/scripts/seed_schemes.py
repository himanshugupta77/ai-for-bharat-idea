#!/usr/bin/env python3
"""
Seed DynamoDB with government scheme data.

This script populates the DynamoDB table with at least 10 major Indian government
welfare schemes including metadata, eligibility rules, and application information.
"""

import os
import sys
import time
import boto3
from typing import List, Dict, Any
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from shared.models import Scheme, EligibilityRule


def get_dynamodb_table():
    """Get DynamoDB table reference."""
    table_name = os.environ.get('DYNAMODB_TABLE', 'bharat-sahayak-data-dev')
    dynamodb = boto3.resource('dynamodb')
    return dynamodb.Table(table_name)


def create_scheme_item(scheme: Scheme) -> Dict[str, Any]:
    """Convert Scheme model to DynamoDB item format."""
    current_timestamp = int(time.time())
    
    return {
        'PK': f'SCHEME#{scheme.schemeId}',
        'SK': 'METADATA',
        'schemeId': scheme.schemeId,
        'name': scheme.name,
        'nameTranslations': scheme.nameTranslations or {},
        'description': scheme.description,
        'descriptionTranslations': scheme.descriptionTranslations or {},
        'category': scheme.category,
        'targetAudience': scheme.targetAudience,
        'benefits': scheme.benefits,
        'eligibilityRules': [rule.dict() for rule in scheme.eligibilityRules],
        'applicationSteps': scheme.applicationSteps,
        'documents': scheme.documents,
        'officialWebsite': scheme.officialWebsite,
        'version': scheme.version,
        'lastUpdated': scheme.lastUpdated or current_timestamp
    }


def get_government_schemes() -> List[Scheme]:
    """Define all government schemes with complete metadata."""
    current_timestamp = int(time.time())
    
    schemes = [
        # 1. PM-KISAN - Pradhan Mantri Kisan Samman Nidhi
        Scheme(
            schemeId='pm-kisan',
            name='PM-KISAN',
            nameTranslations={
                'hi': 'प्रधानमंत्री किसान सम्मान निधि',
                'ta': 'பிரதமர் கிசான் சம்மான் நிதி',
                'te': 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
                'bn': 'প্রধানমন্ত্রী কিষাণ সম্মান নিধি',
                'mr': 'प्रधानमंत्री किसान सन्मान निधी',
                'gu': 'પ્રધાનમંત્રી કિસાન સમ્માન નિધિ',
                'kn': 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ',
                'ml': 'പ്രധാനമന്ത്രി കിസാൻ സമ്മാൻ നിധി',
                'pa': 'ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਕਿਸਾਨ ਸਮਾਨ ਨਿਧੀ',
                'or': 'ପ୍ରଧାନମନ୍ତ୍ରୀ କିଷାଣ ସମ୍ମାନ ନିଧି'
            },
            description='Income support scheme providing ₹6000 per year to small and marginal farmer families',
            descriptionTranslations={
                'hi': 'छोटे और सीमांत किसान परिवारों को प्रति वर्ष ₹6000 की आय सहायता प्रदान करने वाली योजना',
                'ta': 'சிறு மற்றும் குறு விவசாயக் குடும்பங்களுக்கு ஆண்டுக்கு ₹6000 வருமான ஆதரவு வழங்கும் திட்டம்',
            },
            category='agriculture',
            targetAudience='Small and marginal farmers with landholding up to 2 hectares',
            benefits='₹6000 per year in three equal installments of ₹2000 each, directly transferred to bank account',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Land Ownership',
                    type='boolean',
                    requirement='Must own agricultural land',
                    evaluator="lambda u: u.get('ownsLand', False)"
                ),
                EligibilityRule(
                    criterion='Land Size',
                    type='numeric',
                    requirement='Land holding up to 2 hectares',
                    evaluator="lambda u: 0 < u.get('landSize', 0) <= 2"
                ),
            ],
            applicationSteps=[
                'Visit PM-KISAN portal at https://pmkisan.gov.in',
                'Click on "Farmers Corner" and select "New Farmer Registration"',
                'Enter Aadhaar number and mobile number',
                'Fill in personal details and land information',
                'Upload land ownership documents',
                'Submit application and note registration number',
                'Track application status online'
            ],
            documents=[
                'Aadhaar card',
                'Land ownership documents (Khata/Khatauni)',
                'Bank account passbook',
                'Mobile number linked to Aadhaar'
            ],
            officialWebsite='https://pmkisan.gov.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 2. MGNREGA - Mahatma Gandhi National Rural Employment Guarantee Act
        Scheme(
            schemeId='mgnrega',
            name='MGNREGA',
            nameTranslations={
                'hi': 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
                'ta': 'மகாத்மா காந்தி தேசிய கிராமப்புற வேலைவாய்ப்பு உத்தரவாத சட்டம்',
                'te': 'మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ చట్టం',
                'bn': 'মহাত্মা গান্ধী জাতীয় গ্রামীণ কর্মসংস্থান গ্যারান্টি আইন',
            },
            description='Guarantees 100 days of wage employment per year to rural households',
            category='employment',
            targetAudience='Rural households willing to do unskilled manual work',
            benefits='Guaranteed 100 days of wage employment per financial year with minimum wages',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be 18 years or above',
                    evaluator="lambda u: u.get('age', 0) >= 18"
                ),
                EligibilityRule(
                    criterion='Residence',
                    type='string',
                    requirement='Must be a rural household resident',
                    evaluator="lambda u: u.get('occupation', '').lower() in ['farmer', 'laborer', 'agricultural worker', 'daily wage worker']"
                ),
            ],
            applicationSteps=[
                'Visit local Gram Panchayat office',
                'Submit application with photograph',
                'Provide proof of residence',
                'Receive job card within 15 days',
                'Apply for work using job card',
                'Work must be provided within 15 days of application'
            ],
            documents=[
                'Proof of residence (Ration card/Voter ID/Aadhaar)',
                'Passport-size photograph',
                'Bank account details'
            ],
            officialWebsite='https://nrega.nic.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 3. Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana
        Scheme(
            schemeId='ayushman-bharat',
            name='Ayushman Bharat (PM-JAY)',
            nameTranslations={
                'hi': 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
                'ta': 'ஆயுஷ்மான் பாரத் - பிரதமர் ஜன் ஆரோக்ய யோஜனா',
                'te': 'ఆయుష్మాన్ భారత్ - ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన',
            },
            description='Health insurance scheme providing coverage up to ₹5 lakh per family per year',
            category='health',
            targetAudience='Poor and vulnerable families as per SECC 2011 database',
            benefits='Free health insurance coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Economic Status',
                    type='boolean',
                    requirement='Must be from economically weaker section (BPL or SECC listed)',
                    evaluator="lambda u: u.get('isBPL', False) or u.get('income', float('inf')) < 100000"
                ),
            ],
            applicationSteps=[
                'Check eligibility at https://pmjay.gov.in',
                'Visit nearest Ayushman Mitra help desk',
                'Provide Aadhaar and family details',
                'Get Ayushman card issued',
                'Use card at empanelled hospitals for cashless treatment'
            ],
            documents=[
                'Aadhaar card',
                'Ration card (if applicable)',
                'Proof of BPL status or SECC inclusion'
            ],
            officialWebsite='https://pmjay.gov.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 4. Pradhan Mantri Awas Yojana - Housing for All
        Scheme(
            schemeId='pmay',
            name='Pradhan Mantri Awas Yojana (PMAY)',
            nameTranslations={
                'hi': 'प्रधानमंत्री आवास योजना',
                'ta': 'பிரதமர் ஆவாஸ் யோஜனா',
                'te': 'ప్రధాన మంత్రి ఆవాస్ యోజన',
            },
            description='Affordable housing scheme providing financial assistance for construction or purchase of houses',
            category='housing',
            targetAudience='Economically Weaker Section (EWS), Low Income Group (LIG), and Middle Income Group (MIG)',
            benefits='Subsidy on home loans ranging from ₹2.67 lakh to ₹2.35 lakh based on income category',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Income Limit',
                    type='numeric',
                    requirement='Annual household income up to ₹18 lakh',
                    evaluator="lambda u: u.get('income', 0) <= 1800000"
                ),
                EligibilityRule(
                    criterion='House Ownership',
                    type='boolean',
                    requirement='Should not own a pucca house in India',
                    evaluator="lambda u: not u.get('ownsHouse', True)"
                ),
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be 18 years or above',
                    evaluator="lambda u: u.get('age', 0) >= 18"
                ),
            ],
            applicationSteps=[
                'Visit PMAY portal at https://pmaymis.gov.in',
                'Select appropriate category (Urban/Rural)',
                'Fill online application form',
                'Upload required documents',
                'Submit Aadhaar for verification',
                'Track application status online',
                'Receive subsidy after loan approval'
            ],
            documents=[
                'Aadhaar card',
                'Income certificate',
                'Property documents',
                'Bank account details',
                'Caste certificate (if applicable)'
            ],
            officialWebsite='https://pmaymis.gov.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 5. Pradhan Mantri Ujjwala Yojana - LPG Connection
        Scheme(
            schemeId='pmuy',
            name='Pradhan Mantri Ujjwala Yojana (PMUY)',
            nameTranslations={
                'hi': 'प्रधानमंत्री उज्ज्वला योजना',
                'ta': 'பிரதமர் உஜ்வலா யோஜனா',
                'te': 'ప్రధాన మంత్రి ఉజ్జ్వలా యోజన',
            },
            description='Free LPG connection to women from BPL households',
            category='welfare',
            targetAudience='Women from BPL households',
            benefits='Free LPG connection with deposit-free cylinder, pressure regulator, booklet, safety hose',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Gender',
                    type='enum',
                    requirement='Applicant must be a woman',
                    evaluator="lambda u: u.get('gender', '') == 'female'"
                ),
                EligibilityRule(
                    criterion='Economic Status',
                    type='boolean',
                    requirement='Must be from BPL household',
                    evaluator="lambda u: u.get('isBPL', False)"
                ),
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be 18 years or above',
                    evaluator="lambda u: u.get('age', 0) >= 18"
                ),
            ],
            applicationSteps=[
                'Visit nearest LPG distributor',
                'Fill PMUY application form',
                'Submit BPL card and identity proof',
                'Provide address proof and photograph',
                'Get connection installed at home',
                'Receive first refill at subsidized rate'
            ],
            documents=[
                'BPL card or SECC-2011 data',
                'Aadhaar card',
                'Bank account details',
                'Address proof',
                'Passport-size photograph'
            ],
            officialWebsite='https://www.pmuy.gov.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 6. Atal Pension Yojana - Pension Scheme
        Scheme(
            schemeId='apy',
            name='Atal Pension Yojana (APY)',
            nameTranslations={
                'hi': 'अटल पेंशन योजना',
                'ta': 'அடல் பென்ஷன் யோஜனா',
                'te': 'అటల్ పెన్షన్ యోజన',
            },
            description='Pension scheme for unorganized sector workers providing guaranteed pension',
            category='pension',
            targetAudience='Citizens in unorganized sector aged 18-40 years',
            benefits='Guaranteed minimum pension of ₹1000 to ₹5000 per month after 60 years of age',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be between 18 and 40 years',
                    evaluator="lambda u: 18 <= u.get('age', 0) <= 40"
                ),
                EligibilityRule(
                    criterion='Bank Account',
                    type='boolean',
                    requirement='Must have a savings bank account',
                    evaluator="lambda u: u.get('hasBankAccount', True)"
                ),
            ],
            applicationSteps=[
                'Visit your bank branch',
                'Fill APY registration form',
                'Provide Aadhaar and mobile number',
                'Choose pension amount (₹1000 to ₹5000)',
                'Authorize auto-debit for monthly contribution',
                'Receive APY acknowledgment'
            ],
            documents=[
                'Aadhaar card',
                'Bank account details',
                'Mobile number',
                'Nominee details'
            ],
            officialWebsite='https://www.npscra.nsdl.co.in/atal-pension-yojana.php',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 7. Pradhan Mantri Fasal Bima Yojana - Crop Insurance
        Scheme(
            schemeId='pmfby',
            name='Pradhan Mantri Fasal Bima Yojana (PMFBY)',
            nameTranslations={
                'hi': 'प्रधानमंत्री फसल बीमा योजना',
                'ta': 'பிரதமர் பசல் பீமா யோஜனா',
                'te': 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన',
            },
            description='Crop insurance scheme protecting farmers against crop loss due to natural calamities',
            category='agriculture',
            targetAudience='All farmers including sharecroppers and tenant farmers',
            benefits='Comprehensive insurance coverage for crop loss with low premium (1.5% to 5% of sum insured)',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Farmer Status',
                    type='boolean',
                    requirement='Must be a farmer (owner or tenant)',
                    evaluator="lambda u: u.get('occupation', '').lower() in ['farmer', 'agricultural worker'] or u.get('ownsLand', False)"
                ),
            ],
            applicationSteps=[
                'Visit nearest bank, CSC, or insurance company office',
                'Fill crop insurance application form',
                'Provide land details and crop information',
                'Pay premium amount',
                'Receive insurance policy document',
                'Report crop loss within 72 hours if calamity occurs'
            ],
            documents=[
                'Land ownership documents or tenancy agreement',
                'Aadhaar card',
                'Bank account details',
                'Sowing certificate from Patwari'
            ],
            officialWebsite='https://pmfby.gov.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 8. National Social Assistance Programme - Old Age Pension
        Scheme(
            schemeId='nsap-old-age',
            name='National Social Assistance Programme - Old Age Pension',
            nameTranslations={
                'hi': 'राष्ट्रीय सामाजिक सहायता कार्यक्रम - वृद्धावस्था पेंशन',
                'ta': 'தேசிய சமூக உதவித் திட்டம் - முதியோர் ஓய்வூதியம்',
                'te': 'జాతీయ సామాజిక సహాయ కార్యక్రమం - వృద్ధాప్య పెన్షన్',
            },
            description='Monthly pension for elderly citizens from BPL families',
            category='pension',
            targetAudience='Elderly citizens aged 60+ from BPL families',
            benefits='Monthly pension of ₹200 (60-79 years) or ₹500 (80+ years)',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be 60 years or above',
                    evaluator="lambda u: u.get('age', 0) >= 60"
                ),
                EligibilityRule(
                    criterion='Economic Status',
                    type='boolean',
                    requirement='Must be from BPL family',
                    evaluator="lambda u: u.get('isBPL', False)"
                ),
            ],
            applicationSteps=[
                'Visit local Panchayat or Municipal office',
                'Fill pension application form',
                'Submit BPL card and age proof',
                'Provide bank account details',
                'Get application verified by local authority',
                'Receive pension in bank account monthly'
            ],
            documents=[
                'Age proof (Birth certificate/School certificate)',
                'BPL card',
                'Aadhaar card',
                'Bank account passbook',
                'Passport-size photograph'
            ],
            officialWebsite='https://nsap.nic.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 9. Pradhan Mantri Mudra Yojana - Micro Finance
        Scheme(
            schemeId='pmmy',
            name='Pradhan Mantri Mudra Yojana (PMMY)',
            nameTranslations={
                'hi': 'प्रधानमंत्री मुद्रा योजना',
                'ta': 'பிரதமர் முத்ரா யோஜனா',
                'te': 'ప్రధాన మంత్రి ముద్ర యోజన',
            },
            description='Collateral-free loans up to ₹10 lakh for small businesses and entrepreneurs',
            category='business',
            targetAudience='Small business owners, entrepreneurs, and self-employed individuals',
            benefits='Loans up to ₹10 lakh without collateral in three categories: Shishu (up to ₹50k), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L)',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Business Activity',
                    type='string',
                    requirement='Must have income-generating business activity',
                    evaluator="lambda u: u.get('occupation', '').lower() in ['business owner', 'entrepreneur', 'self-employed', 'shopkeeper', 'trader']"
                ),
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be 18 years or above',
                    evaluator="lambda u: u.get('age', 0) >= 18"
                ),
            ],
            applicationSteps=[
                'Prepare business plan and project report',
                'Visit nearest bank, NBFC, or MFI',
                'Fill Mudra loan application form',
                'Submit identity and business documents',
                'Attend bank interview if required',
                'Receive loan approval and disbursement'
            ],
            documents=[
                'Aadhaar card',
                'PAN card',
                'Business plan/project report',
                'Address proof',
                'Bank statements (last 6 months)',
                'Business registration documents (if applicable)'
            ],
            officialWebsite='https://www.mudra.org.in',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 10. Beti Bachao Beti Padhao - Girl Child Welfare
        Scheme(
            schemeId='bbbp',
            name='Beti Bachao Beti Padhao',
            nameTranslations={
                'hi': 'बेटी बचाओ बेटी पढ़ाओ',
                'ta': 'பெண் குழந்தையைக் காப்பாற்றுங்கள் பெண் குழந்தையைக் கல்வி கற்பியுங்கள்',
                'te': 'బేటీ బచావో బేటీ పడావో',
            },
            description='Campaign to address declining Child Sex Ratio and empower girl children through education',
            category='education',
            targetAudience='Girl children and their families',
            benefits='Financial incentives, educational support, and awareness programs for girl child welfare',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Gender',
                    type='enum',
                    requirement='Beneficiary must be a girl child',
                    evaluator="lambda u: u.get('gender', '') == 'female'"
                ),
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be below 18 years',
                    evaluator="lambda u: u.get('age', 0) < 18"
                ),
            ],
            applicationSteps=[
                'Visit Women and Child Development office',
                'Inquire about specific schemes under BBBP',
                'Fill application for relevant sub-scheme',
                'Submit birth certificate and identity proof',
                'Open Sukanya Samriddhi Account if eligible',
                'Participate in awareness programs'
            ],
            documents=[
                'Birth certificate of girl child',
                'Aadhaar card of parents',
                'School enrollment certificate',
                'Bank account details',
                'Income certificate (if required)'
            ],
            officialWebsite='https://wcd.nic.in/bbbp-schemes',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 11. Pradhan Mantri Kaushal Vikas Yojana - Skill Development
        Scheme(
            schemeId='pmkvy',
            name='Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
            nameTranslations={
                'hi': 'प्रधानमंत्री कौशल विकास योजना',
                'ta': 'பிரதமர் கௌஷல் விகாஸ் யோஜனா',
                'te': 'ప్రధాన మంత్రి కౌశల్ వికాస్ యోజన',
            },
            description='Free skill development training with certification and placement assistance',
            category='education',
            targetAudience='Youth seeking skill training and employment',
            benefits='Free skill training, government certification, monetary rewards, and placement assistance',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be between 15 and 45 years',
                    evaluator="lambda u: 15 <= u.get('age', 0) <= 45"
                ),
                EligibilityRule(
                    criterion='Education',
                    type='string',
                    requirement='Should be able to understand training in Hindi or English',
                    evaluator="lambda u: True"  # Basic requirement, always true
                ),
            ],
            applicationSteps=[
                'Visit PMKVY portal at https://www.pmkvyofficial.org',
                'Find nearest training center',
                'Register for desired skill course',
                'Attend training sessions regularly',
                'Complete assessment and get certified',
                'Receive monetary reward and placement support'
            ],
            documents=[
                'Aadhaar card',
                'Educational certificates',
                'Bank account details',
                'Passport-size photograph'
            ],
            officialWebsite='https://www.pmkvyofficial.org',
            version=1,
            lastUpdated=current_timestamp
        ),

        # 12. Stand Up India - SC/ST/Women Entrepreneurship
        Scheme(
            schemeId='stand-up-india',
            name='Stand Up India',
            nameTranslations={
                'hi': 'स्टैंड अप इंडिया',
                'ta': 'ஸ்டாண்ட் அப் இந்தியா',
                'te': 'స్టాండ్ అప్ ఇండియా',
            },
            description='Bank loans between ₹10 lakh and ₹1 crore for SC/ST/Women entrepreneurs',
            category='business',
            targetAudience='SC/ST and Women entrepreneurs for greenfield enterprises',
            benefits='Loans between ₹10 lakh to ₹1 crore for setting up greenfield enterprises in manufacturing, services, or trading sector',
            eligibilityRules=[
                EligibilityRule(
                    criterion='Category or Gender',
                    type='enum',
                    requirement='Must be SC/ST or Woman entrepreneur',
                    evaluator="lambda u: u.get('category', '') in ['sc', 'st'] or u.get('gender', '') == 'female'"
                ),
                EligibilityRule(
                    criterion='Age Requirement',
                    type='numeric',
                    requirement='Must be 18 years or above',
                    evaluator="lambda u: u.get('age', 0) >= 18"
                ),
                EligibilityRule(
                    criterion='Business Type',
                    type='string',
                    requirement='For greenfield enterprise (new business)',
                    evaluator="lambda u: not u.get('hasExistingBusiness', False)"
                ),
            ],
            applicationSteps=[
                'Visit Stand Up India portal at https://www.standupmitra.in',
                'Prepare detailed project report',
                'Apply online through portal',
                'Visit nearest bank branch',
                'Submit application with documents',
                'Attend bank interview',
                'Receive loan approval and disbursement'
            ],
            documents=[
                'Aadhaar card',
                'PAN card',
                'Caste certificate (for SC/ST)',
                'Project report',
                'Address proof',
                'Educational certificates',
                'Bank statements'
            ],
            officialWebsite='https://www.standupmitra.in',
            version=1,
            lastUpdated=current_timestamp
        ),
    ]
    
    return schemes


def batch_write_schemes(table, schemes: List[Scheme]):
    """Write schemes to DynamoDB in batches."""
    print(f"Preparing to seed {len(schemes)} schemes...")
    
    items = [create_scheme_item(scheme) for scheme in schemes]
    
    # DynamoDB batch write supports up to 25 items per batch
    batch_size = 25
    
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        
        with table.batch_writer() as writer:
            for item in batch:
                writer.put_item(Item=item)
                print(f"✓ Seeded scheme: {item['name']} ({item['schemeId']})")
    
    print(f"\n✅ Successfully seeded {len(schemes)} schemes to DynamoDB!")


def verify_seeded_data(table):
    """Verify that schemes were seeded correctly."""
    print("\nVerifying seeded data...")
    
    response = table.scan(
        FilterExpression='begins_with(PK, :pk)',
        ExpressionAttributeValues={':pk': 'SCHEME#'}
    )
    
    schemes = response.get('Items', [])
    print(f"Found {len(schemes)} schemes in database:")
    
    for scheme in schemes:
        print(f"  - {scheme['name']} ({scheme['schemeId']}) - Category: {scheme['category']}")
    
    return len(schemes)


def main():
    """Main execution function."""
    print("=" * 60)
    print("Bharat Sahayak - Government Scheme Data Seeding Script")
    print("=" * 60)
    print()
    
    try:
        # Get DynamoDB table
        table = get_dynamodb_table()
        print(f"Connected to DynamoDB table: {table.table_name}\n")
        
        # Get scheme data
        schemes = get_government_schemes()
        
        # Batch write to DynamoDB
        batch_write_schemes(table, schemes)
        
        # Verify seeded data
        count = verify_seeded_data(table)
        
        if count == len(schemes):
            print(f"\n✅ Verification successful! All {count} schemes seeded correctly.")
            return 0
        else:
            print(f"\n⚠️  Warning: Expected {len(schemes)} schemes but found {count}")
            return 1
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
