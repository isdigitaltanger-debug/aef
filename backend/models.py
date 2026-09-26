import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, BeforeValidator, field_validator
from typing_extensions import Annotated


def _coerce_oid(v: Any) -> Any:
    if isinstance(v, ObjectId):
        return str(v)
    return v


PyObjectId = Annotated[str, BeforeValidator(_coerce_oid)]


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize(doc: Optional[dict]) -> Optional[dict]:
    """Mongo -> JSON safe dict (_id -> id, datetime -> iso)."""
    if not doc:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def serialize_list(docs):
    return [serialize(d) for d in docs or []]


class BaseDocument(BaseModel):
    """Base model mapping Mongo _id -> id."""

    model_config = ConfigDict(populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: Optional[dict]):
        if not doc:
            return None
        data = dict(doc)
        data["_id"] = str(data.get("_id"))
        return cls(**data)


PHONE_RE = re.compile(r"(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}")


class ContactInfo(BaseModel):
    prenom: str = Field(min_length=1, max_length=60)
    nom: str = Field(min_length=1, max_length=80)
    telephone: str = Field(min_length=8, max_length=24)
    email: EmailStr

    @field_validator("prenom", "nom")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Champ requis")
        return v

    @field_validator("telephone")
    @classmethod
    def _phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.fullmatch(v):
            raise ValueError("Numéro de téléphone français invalide")
        return v


PROJETS = ["ssc", "pac_ssc", "pac", "isolation", "chauffage", "autre", "ne_sais_pas"]
STATUTS = ["proprietaire_occupant", "proprietaire_bailleur", "locataire", "autre"]
TYPES_LOGEMENT = ["maison", "appartement", "autre"]
OUI_NON = ["oui", "non", "incertain", "inconnu"]
CHAUFFAGES = ["chaudiere_gaz", "chaudiere_fioul", "pac", "radiateurs_electriques", "autre", "inconnu"]
EMETTEURS = ["acier", "aluminium", "fonte", "autre", "inconnu"]
ORIENTATIONS = ["sud", "est", "ouest", "nord", "mixte", "inconnu"]


class Answers(BaseModel):
    projet: str
    statut: str
    type_logement: str
    plus_de_2_ans: str
    surface: int = Field(ge=9, le=3000)
    code_postal: str
    commune: str = ""
    occupants: int = Field(ge=1, le=25)
    chauffage_actuel: str
    emetteurs: str
    toiture_orientation: str
    surface_toiture_16m2: str
    espace_technique: str

    @field_validator("projet")
    @classmethod
    def _projet(cls, v):
        if v not in PROJETS:
            raise ValueError("Type de projet invalide")
        return v

    @field_validator("statut")
    @classmethod
    def _statut(cls, v):
        if v not in STATUTS:
            raise ValueError("Statut invalide")
        return v

    @field_validator("type_logement")
    @classmethod
    def _type(cls, v):
        if v not in TYPES_LOGEMENT:
            raise ValueError("Type de logement invalide")
        return v

    @field_validator("plus_de_2_ans", "surface_toiture_16m2", "espace_technique")
    @classmethod
    def _ouinon(cls, v):
        if v not in OUI_NON:
            raise ValueError("Valeur invalide")
        return v

    @field_validator("code_postal")
    @classmethod
    def _cp(cls, v):
        v = v.strip()
        if not re.fullmatch(r"\d{5}", v):
            raise ValueError("Code postal invalide (5 chiffres)")
        return v

    @field_validator("chauffage_actuel")
    @classmethod
    def _chauffage(cls, v):
        if v not in CHAUFFAGES:
            raise ValueError("Chauffage invalide")
        return v

    @field_validator("emetteurs")
    @classmethod
    def _emetteurs(cls, v):
        if v not in EMETTEURS:
            raise ValueError("Émetteurs invalides")
        return v

    @field_validator("toiture_orientation")
    @classmethod
    def _orientation(cls, v):
        if v not in ORIENTATIONS:
            raise ValueError("Orientation invalide")
        return v


class LeadCreate(BaseModel):
    answers: Answers
    contact: ContactInfo
    contact_ok: bool
    marketing_ok: bool = False
    utm: dict = Field(default_factory=dict)
    website: str = ""
    partner: str = ""


class ContactCreate(BaseModel):
    nom: str = Field(min_length=1, max_length=120)
    email: EmailStr
    sujet: str = Field(default="", max_length=160)
    message: str = Field(min_length=10, max_length=4000)
    contact_ok: bool
    website: str = ""

    @field_validator("nom")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Champ requis")
        return v


class CallbackCreate(BaseModel):
    nom: str = Field(min_length=1, max_length=120)
    telephone: str = Field(min_length=8, max_length=24)
    slot: str = Field(default="", max_length=60)
    contact_ok: bool
    website: str = ""

    @field_validator("nom")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Champ requis")
        return v

    @field_validator("telephone")
    @classmethod
    def _phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.fullmatch(v):
            raise ValueError("Numéro de téléphone français invalide")
        return v
