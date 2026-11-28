
from sqlalchemy import select

from app.database.models.catalog import Category, Venue
from app.database.session import SessionLocal

CATEGORIES = [
    "Library",
    "Building",
    "Gym",
    "Cafeteria",
    "Shop",
]


def seed_categories():
    db = SessionLocal()

    try:
        for name in CATEGORIES:
            category = db.scalar(
                select(Category).where(Category.name == name)
            )

            if category is None:
                db.add(Category(name=name))
                print(f"Added category: {name}")
            else:
                print(f"Category already exists: {name}")

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


VENUES = {
    "Library": [
        "Mustafa İnan Merkez Kütüphanesi",
        "Rektörlük Kütüphanesi",
    ],
    "Building": [
        "Rektörlük",
        "Bilgisayar ve Bilişim Fakültesi",
        "Elektrik-Elektronik Fakültesi",
        "İnşaat Fakültesi",
        "Makine Fakültesi",
        "Maden Fakültesi",
        "Kimya-Metalurji Fakültesi",
        "Fen-Edebiyat Fakültesi",
        "Uçak ve Uzay Bilimleri Fakültesi",
        "Gemi İnşaatı ve Deniz Bilimleri Fakültesi",
        "Merkezi Derslik",
        "Süleyman Demirel Kültür Merkezi",
    ],
   "Gym": [
    "Merkez Spor Salonu",
    "Olimpik Yüzme Havuzu",
    "Vadi Yurtları Spor Salonu",
    "Tenis Kortları",
    "Padel Kortları",
    "Voleybol Sahası",
    ],
    "Cafeteria": [
        "İTÜ Yemekhane",
        "Fanfan",
        "Espressolab",
    ],
    "Shop": [
        "Migros",
        "A101",
        "Şok",
        "Gratis",
        "1773 İTÜ Store",
    ],
}


def seed_venues():
    db = SessionLocal()

    try:
        categories = {
            category.name: category
            for category in db.scalars(select(Category)).all()
        }

        for category_name, venue_names in VENUES.items():
            category = categories.get(category_name)

            if category is None:
                raise ValueError(
                    f"Category not found: {category_name}"
                )

            for venue_name in venue_names:
                existing = db.scalar(
                    select(Venue).where(Venue.name == venue_name)
                )

                if existing is None:
                    db.add(
                        Venue(
                            name=venue_name,
                            category_id=category.id,
                        )
                    )
                    print(f"Added venue: {venue_name}")

                elif existing.category_id != category.id:
                    print(
                        f"WARNING: {venue_name} has a different category!"
                    )

                else:
                    print(f"Already exists: {venue_name}")

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()
    seed_venues()

