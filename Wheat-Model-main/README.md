PART 1️ TRAINING PHASE ERRORS (train_ann.py)
 Error 1: ModuleNotFoundError: No module named 'sklearn'
🔹 Why it happens

Required libraries are not installed

Virtual environment is not active

* How to fix

Activate virtual environment:

.\venv\Scripts\Activate.ps1


Install dependencies:

python -m pip install scikit-learn numpy pandas


Verify:

python -m pip list

** Error 2: FileNotFoundError: wheat_str_final.xlsx
🔹 Why it happens

Dataset file is not in the same directory as train_ann.py

Wrong file name or path

** How to fix

Option 1: Move dataset to project folder
Option 2: Use absolute path

df = pd.read_excel("C:/Users/Jaikumar/Downloads/wheat_str_final.xlsx")

**Error 3: KeyError: 'vegetation_stress_score'
🔹 Why it happens

Column name mismatch between dataset and code

**How to fix

Check column names:

print(df.columns)


Update FEATURE_COLUMNS to match exact spelling.

** Error 4: Model trains but MAE is very high
🔹 Why it happens

Unscaled inputs

Wrong target columns

Stress values not normalized

** How to fix

✔ Always use StandardScaler
✔ Confirm stress score ranges are consistent
✔ Check target columns:

TARGET_COLUMNS = [
    "prob_rust",
    "prob_blight",
    "prob_root_rot",
    "prob_healthy"
]

** Error 5: .pkl files not created
🔹 Why it happens

Script crashed before saving

Permission issue

** How to fix

Run script from project directory

Ensure write permission

Run:

python train_ann.py


You should see:

Training complete. Production files saved.

PART 2️ ENVIRONMENT & PACKAGE ERRORS
 Error:

Defaulting to user installation because normal site-packages is not writeable

🔹 Why it happens

Windows Store Python

Virtual environment not actually active

** How to fix (Correct Way)

Always install using:

python -m pip install fastapi uvicorn numpy scikit-learn pydantic


Never rely on:

pip install ...

** Error: pip list shows only pip
🔹 Why it happens

Fresh virtual environment

Packages not installed yet

** How to fix
python -m pip install fastapi uvicorn numpy scikit-learn pydantic


Verify:

python -m pip list

PART 3️ FASTAPI ERRORS (main.py)
** Error:

Error loading ASGI app. Attribute "app" not found in module "main"

🔹 Why it happens

Missing app = FastAPI() in main.py

File not named main.py

** How to fix

Make sure main.py contains:

app = FastAPI()


And run:

python -m uvicorn main:app --reload

** Error:

InconsistentVersionWarning: Trying to unpickle estimator

🔹 Why it happens

Model trained with one version of scikit-learn

Inference uses another version

** How to fix (Recommended)

Install matching version:

python -m pip uninstall scikit-learn -y
python -m pip install scikit-learn==1.4.2


Verify:

python -m pip show scikit-learn

** Error:

ValueError: y contains previously unseen labels

🔹 Why it happens

Encoder sees a crop or growth stage not present during training

** How to fix

Option 1 (Best):

Retrain model including new crop/stage

Option 2 (Temporary):

Validate inputs before prediction

Reject unseen categories with 400 error

** Error:

API runs but prediction values are weird

🔹 Why it happens

Forgot to apply scaler

Feature order mismatch

** How to fix

Ensure inference input order matches training:

X = [
  vegetation,
  water,
  soil,
  final_stress,
  gdd_min,
  gdd_max,
  crop_enc,
  stage_enc
]


And always call:

scaler.transform(X)

PART 4️ CORRECT TERMINAL COMMANDS (CHEAT SHEET)
🔹 Create virtual environment
python -m venv venv

🔹 Activate virtual environment
.\venv\Scripts\Activate.ps1

🔹 Install dependencies
python -m pip install fastapi uvicorn numpy scikit-learn pandas pydantic

🔹 Train ANN
python train_ann.py

🔹 Run FastAPI
python -m uvicorn main:app --reload

🔹 Open Swagger UI
http://127.0.0.1:8000/docs

PART 5️ COMMON MISTAKES (AVOID THESE)

* Predicting disease directly from indices
* Training ANN to calculate stress
* Skipping scaler during inference
* Changing feature order
* Using global Python instead of venv

** FINAL SUMMARY

Training errors → usually data or environment related

FastAPI errors → usually missing app or version mismatch

Most Windows issues → solved by python -m pip

Your architecture is correct and production-ready
