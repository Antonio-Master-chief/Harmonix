"""
Seed the Harmonix library with 100 well-known songs (metadata only).
Songs will be visible in the library page; fingerprints can be added later
by running songs through /library/add when audio files are available.
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

from supabase import create_client

SONGS = [
    # ── 85 English ─────────────────────────────────────────────────────────────
    # Pop
    {"title": "Shape of You",           "artist": "Ed Sheeran",                    "album": "÷ (Divide)",                "genre": "Pop",              "duration": 234},
    {"title": "Blinding Lights",         "artist": "The Weeknd",                    "album": "After Hours",               "genre": "Pop",              "duration": 200},
    {"title": "Rolling in the Deep",     "artist": "Adele",                         "album": "21",                        "genre": "Pop",              "duration": 228},
    {"title": "Bad Guy",                 "artist": "Billie Eilish",                 "album": "When We All Fall Asleep",   "genre": "Pop",              "duration": 194},
    {"title": "Uptown Funk",             "artist": "Mark Ronson ft. Bruno Mars",    "album": "Uptown Special",            "genre": "Pop",              "duration": 270},
    {"title": "Shake It Off",            "artist": "Taylor Swift",                  "album": "1989",                      "genre": "Pop",              "duration": 219},
    {"title": "Someone Like You",        "artist": "Adele",                         "album": "21",                        "genre": "Pop",              "duration": 285},
    {"title": "Stay With Me",            "artist": "Sam Smith",                     "album": "In the Lonely Hour",        "genre": "Pop",              "duration": 172},
    {"title": "Happy",                   "artist": "Pharrell Williams",             "album": "G I R L",                   "genre": "Pop",              "duration": 233},
    {"title": "Thinking Out Loud",       "artist": "Ed Sheeran",                    "album": "X",                         "genre": "Pop",              "duration": 281},
    {"title": "Anti-Hero",               "artist": "Taylor Swift",                  "album": "Midnights",                 "genre": "Pop",              "duration": 200},
    {"title": "Flowers",                 "artist": "Miley Cyrus",                   "album": "Endless Summer Vacation",   "genre": "Pop",              "duration": 200},
    {"title": "drivers license",         "artist": "Olivia Rodrigo",                "album": "SOUR",                      "genre": "Pop",              "duration": 242},
    {"title": "good 4 u",                "artist": "Olivia Rodrigo",                "album": "SOUR",                      "genre": "Pop",              "duration": 178},
    {"title": "Levitating",              "artist": "Dua Lipa",                      "album": "Future Nostalgia",          "genre": "Pop",              "duration": 203},
    {"title": "Don't Start Now",         "artist": "Dua Lipa",                      "album": "Future Nostalgia",          "genre": "Pop",              "duration": 183},
    {"title": "Peaches",                 "artist": "Justin Bieber",                 "album": "Justice",                   "genre": "Pop",              "duration": 198},
    {"title": "Sorry",                   "artist": "Justin Bieber",                 "album": "Purpose",                   "genre": "Pop",              "duration": 200},
    {"title": "Love Yourself",           "artist": "Justin Bieber",                 "album": "Purpose",                   "genre": "Pop",              "duration": 233},
    {"title": "As It Was",               "artist": "Harry Styles",                  "album": "Harry's House",             "genre": "Pop",              "duration": 167},
    {"title": "Watermelon Sugar",        "artist": "Harry Styles",                  "album": "Fine Line",                 "genre": "Pop",              "duration": 174},
    {"title": "No Tears Left to Cry",    "artist": "Ariana Grande",                 "album": "Sweetener",                 "genre": "Pop",              "duration": 207},
    {"title": "thank u, next",           "artist": "Ariana Grande",                 "album": "thank u, next",             "genre": "Pop",              "duration": 207},
    {"title": "7 Rings",                 "artist": "Ariana Grande",                 "album": "thank u, next",             "genre": "Pop",              "duration": 178},
    {"title": "Shallow",                 "artist": "Lady Gaga & Bradley Cooper",    "album": "A Star Is Born",            "genre": "Pop",              "duration": 216},
    {"title": "Poker Face",              "artist": "Lady Gaga",                     "album": "The Fame",                  "genre": "Pop",              "duration": 238},
    {"title": "Born This Way",           "artist": "Lady Gaga",                     "album": "Born This Way",             "genre": "Pop",              "duration": 260},
    {"title": "Love Story",              "artist": "Taylor Swift",                  "album": "Fearless",                  "genre": "Pop",              "duration": 235},
    {"title": "You Belong With Me",      "artist": "Taylor Swift",                  "album": "Fearless",                  "genre": "Pop",              "duration": 231},
    {"title": "...Baby One More Time",   "artist": "Britney Spears",                "album": "...Baby One More Time",     "genre": "Pop",              "duration": 211},
    # Rock
    {"title": "Bohemian Rhapsody",       "artist": "Queen",                         "album": "A Night at the Opera",      "genre": "Rock",             "duration": 354},
    {"title": "Hotel California",        "artist": "Eagles",                        "album": "Hotel California",          "genre": "Rock",             "duration": 391},
    {"title": "Smells Like Teen Spirit", "artist": "Nirvana",                       "album": "Nevermind",                 "genre": "Rock",             "duration": 301},
    {"title": "Sweet Child O' Mine",     "artist": "Guns N' Roses",                 "album": "Appetite for Destruction",  "genre": "Rock",             "duration": 356},
    {"title": "Stairway to Heaven",      "artist": "Led Zeppelin",                  "album": "Led Zeppelin IV",           "genre": "Rock",             "duration": 482},
    {"title": "Don't Stop Believin'",    "artist": "Journey",                       "album": "Escape",                    "genre": "Rock",             "duration": 251},
    {"title": "Eye of the Tiger",        "artist": "Survivor",                      "album": "Eye of the Tiger",          "genre": "Rock",             "duration": 245},
    {"title": "We Will Rock You",        "artist": "Queen",                         "album": "News of the World",         "genre": "Rock",             "duration": 122},
    {"title": "Livin' on a Prayer",      "artist": "Bon Jovi",                      "album": "Slippery When Wet",         "genre": "Rock",             "duration": 249},
    {"title": "Come As You Are",         "artist": "Nirvana",                       "album": "Nevermind",                 "genre": "Rock",             "duration": 219},
    {"title": "Somebody That I Used to Know", "artist": "Gotye",                    "album": "Making Mirrors",            "genre": "Indie Rock",       "duration": 244},
    {"title": "Mr. Brightside",          "artist": "The Killers",                   "album": "Hot Fuss",                  "genre": "Indie Rock",       "duration": 222},
    {"title": "Seven Nation Army",       "artist": "The White Stripes",             "album": "Elephant",                  "genre": "Rock",             "duration": 231},
    {"title": "Use Somebody",            "artist": "Kings of Leon",                 "album": "Only by the Night",         "genre": "Rock",             "duration": 232},
    {"title": "Viva la Vida",            "artist": "Coldplay",                      "album": "Viva la Vida",              "genre": "Alternative Rock", "duration": 242},
    {"title": "The Scientist",           "artist": "Coldplay",                      "album": "A Rush of Blood to the Head", "genre": "Alternative Rock", "duration": 309},
    {"title": "Yellow",                  "artist": "Coldplay",                      "album": "Parachute",                 "genre": "Alternative Rock", "duration": 269},
    {"title": "Fix You",                 "artist": "Coldplay",                      "album": "X&Y",                       "genre": "Alternative Rock", "duration": 295},
    # Hip-Hop / R&B
    {"title": "God's Plan",              "artist": "Drake",                         "album": "Scorpion",                  "genre": "Hip-Hop",          "duration": 198},
    {"title": "Rockstar",                "artist": "Post Malone ft. 21 Savage",     "album": "Beerbongs & Bentleys",      "genre": "Hip-Hop",          "duration": 218},
    {"title": "Old Town Road",           "artist": "Lil Nas X",                     "album": "7 EP",                      "genre": "Hip-Hop",          "duration": 113},
    {"title": "HUMBLE.",                 "artist": "Kendrick Lamar",                "album": "DAMN.",                     "genre": "Hip-Hop",          "duration": 177},
    {"title": "Lose Yourself",           "artist": "Eminem",                        "album": "8 Mile Soundtrack",         "genre": "Hip-Hop",          "duration": 326},
    {"title": "In My Feelings",          "artist": "Drake",                         "album": "Scorpion",                  "genre": "Hip-Hop",          "duration": 218},
    {"title": "Industry Baby",           "artist": "Lil Nas X ft. Jack Harlow",     "album": "Montero",                   "genre": "Hip-Hop",          "duration": 212},
    {"title": "MONTERO (Call Me By Your Name)", "artist": "Lil Nas X",             "album": "Montero",                   "genre": "Hip-Hop",          "duration": 137},
    {"title": "Sicko Mode",              "artist": "Travis Scott",                  "album": "Astroworld",                "genre": "Hip-Hop",          "duration": 312},
    {"title": "Girls Like You",          "artist": "Maroon 5 ft. Cardi B",         "album": "Red Pill Blues",            "genre": "Pop/R&B",          "duration": 235},
    {"title": "Moves Like Jagger",       "artist": "Maroon 5 ft. Christina Aguilera", "album": "Hands All Over",          "genre": "Pop",              "duration": 201},
    {"title": "Stay",                    "artist": "The Kid LAROI & Justin Bieber", "album": "F*ck Love 3",               "genre": "Pop",              "duration": 141},
    # Classic & Timeless
    {"title": "Billie Jean",             "artist": "Michael Jackson",               "album": "Thriller",                  "genre": "Pop",              "duration": 294},
    {"title": "Thriller",                "artist": "Michael Jackson",               "album": "Thriller",                  "genre": "Pop",              "duration": 358},
    {"title": "Beat It",                 "artist": "Michael Jackson",               "album": "Thriller",                  "genre": "Pop",              "duration": 258},
    {"title": "Imagine",                 "artist": "John Lennon",                   "album": "Imagine",                   "genre": "Classic Rock",     "duration": 187},
    {"title": "Let It Be",               "artist": "The Beatles",                   "album": "Let It Be",                 "genre": "Classic Rock",     "duration": 243},
    {"title": "Hey Jude",                "artist": "The Beatles",                   "album": "Hey Jude",                  "genre": "Classic Rock",     "duration": 431},
    {"title": "Yesterday",               "artist": "The Beatles",                   "album": "Help!",                     "genre": "Classic Rock",     "duration": 125},
    {"title": "Come Together",           "artist": "The Beatles",                   "album": "Abbey Road",                "genre": "Classic Rock",     "duration": 259},
    {"title": "Purple Haze",             "artist": "Jimi Hendrix",                  "album": "Are You Experienced",       "genre": "Classic Rock",     "duration": 170},
    {"title": "What a Wonderful World",  "artist": "Louis Armstrong",               "album": "What a Wonderful World",    "genre": "Jazz",             "duration": 137},
    {"title": "Respect",                 "artist": "Aretha Franklin",               "album": "I Never Loved a Man the Way I Love You", "genre": "Soul/R&B", "duration": 147},
    {"title": "I Will Survive",          "artist": "Gloria Gaynor",                 "album": "Love Tracks",               "genre": "Disco",            "duration": 199},
    {"title": "Dancing Queen",           "artist": "ABBA",                          "album": "Arrival",                   "genre": "Pop",              "duration": 231},
    {"title": "Take On Me",              "artist": "A-ha",                          "album": "Hunting High and Low",      "genre": "Pop",              "duration": 225},
    {"title": "Africa",                  "artist": "Toto",                          "album": "Toto IV",                   "genre": "Pop Rock",         "duration": 295},
    # Electronic / Dance
    {"title": "One More Time",           "artist": "Daft Punk",                     "album": "Discovery",                 "genre": "Electronic",       "duration": 321},
    {"title": "Get Lucky",               "artist": "Daft Punk ft. Pharrell Williams", "album": "Random Access Memories",  "genre": "Electronic",       "duration": 248},
    {"title": "Titanium",                "artist": "David Guetta ft. Sia",          "album": "Nothing but the Beat",      "genre": "Electronic/Pop",   "duration": 245},
    {"title": "Chandelier",              "artist": "Sia",                           "album": "1000 Forms of Fear",        "genre": "Pop",              "duration": 217},
    {"title": "Elastic Heart",           "artist": "Sia",                           "album": "1000 Forms of Fear",        "genre": "Pop",              "duration": 257},
    # The Weeknd
    {"title": "Save Your Tears",         "artist": "The Weeknd",                    "album": "After Hours",               "genre": "Pop",              "duration": 215},
    {"title": "Starboy",                 "artist": "The Weeknd ft. Daft Punk",      "album": "Starboy",                   "genre": "Pop",              "duration": 230},
    {"title": "The Hills",               "artist": "The Weeknd",                    "album": "Beauty Behind the Madness", "genre": "R&B",              "duration": 242},

    # ── 10 International ───────────────────────────────────────────────────────
    {"title": "Despacito",               "artist": "Luis Fonsi ft. Daddy Yankee",   "album": "Vida",                      "genre": "Latin Pop",        "duration": 229},
    {"title": "Gangnam Style",           "artist": "PSY",                           "album": "Psy 6 (Six Rules)",         "genre": "K-Pop",            "duration": 212},
    {"title": "Havana",                  "artist": "Camila Cabello ft. Young Thug", "album": "Camila",                    "genre": "Latin Pop",        "duration": 217},
    {"title": "Con Calma",               "artist": "Daddy Yankee & Snow",           "album": "Con Calma",                 "genre": "Reggaeton",        "duration": 189},
    {"title": "La Bamba",                "artist": "Ritchie Valens",                "album": "Ritchie Valens",            "genre": "Latin",            "duration": 120},
    {"title": "Besame Mucho",            "artist": "Trio Los Panchos",              "album": "Besame Mucho",              "genre": "Latin Bolero",     "duration": 195},
    {"title": "Bella Ciao",              "artist": "Traditional",                   "album": "Italian Folk",              "genre": "Folk",             "duration": 185},
    {"title": "La Vie en Rose",          "artist": "Édith Piaf",                    "album": "La Vie en Rose",            "genre": "French Pop",       "duration": 200},
    {"title": "99 Luftballons",          "artist": "Nena",                          "album": "Nena",                      "genre": "Pop Rock",         "duration": 237},
    {"title": "Bésame Mucho",            "artist": "Andrea Bocelli",                "album": "Romanza",                   "genre": "Classical Pop",    "duration": 210},

    # ── 5 Sinhala ──────────────────────────────────────────────────────────────
    {"title": "Nuba Mage Adaraya",       "artist": "Clarence Wijewardena",          "album": "Sinhala Classics",          "genre": "Sinhala Pop",      "duration": 210},
    {"title": "Me Mal Maduwe",           "artist": "Neela Wickramasinghe",          "album": "Sinhala Baila",             "genre": "Baila",            "duration": 195},
    {"title": "Sandakada Pahana",        "artist": "Rookantha Gunathilake",         "album": "Sinhala Pop Hits",          "genre": "Sinhala Pop",      "duration": 240},
    {"title": "Api Wage Premayak",       "artist": "Rookantha Gunathilake",         "album": "Sinhala Pop Hits",          "genre": "Sinhala Pop",      "duration": 220},
    {"title": "Dahasak Muhude",          "artist": "Gunadasa Kapuge",               "album": "Sinhala Traditional",       "genre": "Sinhala Folk",     "duration": 230},
]

def main():
    url  = os.environ["SUPABASE_URL"]
    key  = os.environ["SUPABASE_SERVICE_KEY"]
    db   = create_client(url, key)

    # Check how many songs already exist
    existing = db.table("songs").select("id", count="exact").execute()
    print(f"Existing songs: {existing.count}")

    # Pad each song with the required non-null array fields (empty = no fingerprint yet)
    padded = []
    for s in SONGS:
        padded.append({**s, "intervals_s1": [], "intervals_s2": [], "contour": []})

    # Insert in batches of 20
    inserted = 0
    errors   = 0
    for i in range(0, len(padded), 20):
        batch = padded[i:i+20]
        try:
            resp = db.table("songs").insert(batch).execute()
            inserted += len(resp.data)
            print(f"  Inserted batch {i//20 + 1}: {len(resp.data)} songs")
        except Exception as e:
            print(f"  ERROR on batch {i//20 + 1}: {e}")
            errors += 1

    print(f"\nDone. Inserted {inserted} songs, {errors} errors.")

if __name__ == "__main__":
    main()
