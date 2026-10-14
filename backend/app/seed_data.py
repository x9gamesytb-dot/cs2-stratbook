from sqlalchemy.orm import Session
from .models.strat import Strat

def seed_database(db: Session):
    # Vérifier si des stratégies existent déjà
    if db.query(Strat).first():
        return

    print("[Seed] Initialisation du Playbook tactique CS2...")

    strats = [
        # Mirage
        Strat(
            map_name="Mirage",
            title="Exécution A - Triple Smoke & Pop Flash",
            buy_phase="Full buy",
            side="T-Side",
            category="Execution",
            description="Exécution A coordonnée. Les 3 smokes clés (Stairs, CT Spawn, Jungle) atterrissent simultanément à 1:40, suivies d'une double pop-flash Palace pour neutraliser le site et sécuriser le plant Default.",
            assigned_roles={
                "IGL": "Smoke Jungle / Connector depuis T Spawn.",
                "Support": "Smoke Stairs et Flash aveuglante au-dessus du Palace.",
                "Entry": "Smoke CT Spawn, prise de duel Ramp vers Tetris.",
                "AWP / Sniper": "Contrôle Underpass puis surveillance connector.",
                "Lurker": "Fake contact B Apartments ou prise d'info Palace."
            },
            callouts=["A Site", "Palace", "A Ramp", "Stairs", "Jungle", "CT Spawn", "Tetris"],
            pins=[
                {
                    "id": "mirage-pin-1",
                    "x": 62.0,
                    "y": 68.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Stairs",
                    "description": "Aligné au poteau en T Spawn, viser le coin du mur en brique, Jumpthrow.",
                    "throw_type": "Jumpthrow",
                    "player_role": "Support"
                },
                {
                    "id": "mirage-pin-2",
                    "x": 72.5,
                    "y": 62.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke CT Spawn",
                    "description": "Coin de la barrière T Spawn, viser le panneau solaire, W-jumpthrow.",
                    "throw_type": "W-jumpthrow",
                    "player_role": "Entry"
                },
                {
                    "id": "mirage-pin-3",
                    "x": 58.0,
                    "y": 59.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Jungle / Con",
                    "description": "Deuxième marche en T Spawn, viser le coin de l'antenne, Left-click.",
                    "throw_type": "Left-click",
                    "player_role": "IGL"
                },
                {
                    "id": "mirage-pin-4",
                    "x": 66.0,
                    "y": 74.0,
                    "type": "flash",
                    "side": "T-Side",
                    "title": "High Pop-Flash Palace",
                    "description": "Lancé au-dessus du toit par le Support pour aveugler toute l'équipe CT sur le site.",
                    "throw_type": "Run-throw",
                    "player_role": "Support"
                }
            ]
        ),
        Strat(
            map_name="Mirage",
            title="Heavy Mid Control & Connector Split",
            buy_phase="Full buy",
            side="T-Side",
            category="Mid Control",
            description="Contrôle total du Top Mid dès 1:45. Smoke Window instantanée + Molotov Catwalk. Pression Connector pour isoler l'AWP adverse et forcer une prise d'A en pince (Ramp + Connector).",
            assigned_roles={
                "IGL": "Smoke Window depuis le spawn avec le repère poubelle.",
                "Support": "Molotov Catwalk / Short depuis Top Mid.",
                "AWP / Sniper": "Prend le duel Window / Connector avec le Sniper adverse.",
                "Entry": "Push Underpass vers B Short ou Connector.",
                "Lurker": "Fait du bruit A Ramp pour fixer les CT sur le site A."
            },
            callouts=["Mid", "Window", "Connector", "Top Mid", "Underpass", "Short"],
            pins=[
                {
                    "id": "mirage-mid-1",
                    "x": 48.0,
                    "y": 48.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Instant Window Smoke",
                    "description": "Alignement poubelle T-Spawn, viser l'antenne, W+Jumpthrow.",
                    "throw_type": "W-jumpthrow",
                    "player_role": "IGL"
                },
                {
                    "id": "mirage-mid-2",
                    "x": 43.0,
                    "y": 52.0,
                    "type": "molotov",
                    "side": "T-Side",
                    "title": "Molotov Short / Catwalk",
                    "description": "Bloque l'avancée du support CT sur Catwalk.",
                    "throw_type": "Run-throw",
                    "player_role": "Support"
                }
            ]
        ),
        Strat(
            map_name="Mirage",
            title="Retake A - Deep CT Flash & Jungle Pinch",
            buy_phase="Full buy",
            side="CT-Side",
            category="Retake Setup",
            description="Protocole de reprise de site à 3 CT (1 CT Spawn, 2 Jungle/Connector). Attente des utilitaires avant tout engagement.",
            assigned_roles={
                "IGL": "Coordination du timing et flash Ticket Booth.",
                "Entry": "Reprise côté CT Spawn avec smoke de defuse.",
                "Support": "Molotov Tetris depuis Jungle.",
                "AWP / Sniper": "Surveille Palace et A Ramp depuis Connector."
            },
            callouts=["A Site", "Tetris", "Default Plant", "Ticket", "Jungle"],
            pins=[
                {
                    "id": "mirage-retake-1",
                    "x": 65.0,
                    "y": 66.0,
                    "type": "retake",
                    "side": "CT-Side",
                    "title": "Defuse Box Crossfire",
                    "description": "Crossfire entre Ticket Booth et Jungle pour couvrir le diffuseur.",
                    "throw_type": "Left-click",
                    "player_role": "Support"
                }
            ]
        ),

        # Inferno
        Strat(
            map_name="Inferno",
            title="Banana Control - Car Molotov & Coffin Smoke",
            buy_phase="Full buy",
            side="T-Side",
            category="Execution",
            description="Prise agressive de Banana dès l'entame du round. Double grenade HE sur Sandbags, molotov Car puis smoke Coffin + CT pour ouvrir le site B.",
            assigned_roles={
                "IGL": "Smoke Coffin depuis Half-Wall.",
                "Entry": "Molotov Car et premier duel vers B Site.",
                "Support": "Double Flash aveuglante au-dessus du bâtiment Banana.",
                "AWP / Sniper": "Ligne sur CT Spawn une fois les smokes posées.",
                "Lurker": "Surveillance Appartements A pour punir les pushs CT."
            },
            callouts=["Banana", "Car", "Sandbags", "Coffin", "CT Spawn", "B Site"],
            pins=[
                {
                    "id": "inferno-pin-1",
                    "x": 38.0,
                    "y": 32.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Coffin",
                    "description": "Depuis Half-Wall, viser le haut de la tour de l'église, Jumpthrow.",
                    "throw_type": "Jumpthrow",
                    "player_role": "IGL"
                },
                {
                    "id": "inferno-pin-2",
                    "x": 48.0,
                    "y": 28.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Deep CT",
                    "description": "Bloque la vision des renforts arrivant du spawn CT vers le site B.",
                    "throw_type": "Run-throw",
                    "player_role": "Support"
                },
                {
                    "id": "inferno-pin-3",
                    "x": 42.0,
                    "y": 42.0,
                    "type": "molotov",
                    "side": "T-Side",
                    "title": "Molotov Car / Sandbags",
                    "description": "Dégage le joueur CT avancé à Car.",
                    "throw_type": "Left-click",
                    "player_role": "Entry"
                }
            ]
        ),

        # Nuke
        Strat(
            map_name="Nuke",
            title="Outside Smokes Wall - Secret Sneak",
            buy_phase="Full buy",
            side="T-Side",
            category="Execution",
            description="Mur de 3 smokes Outside permettant de glisser discrètement vers Secret et d'envahir le site B (Lower) sans être vu par l'AWP Garage.",
            assigned_roles={
                "IGL": "Smoke Cross #1 depuis T Roof.",
                "Support": "Smoke Middle #2 et Deep Garage #3.",
                "Entry": "Passe le mur en premier avec flash aveuglante Secret.",
                "AWP / Sniper": "Surveillance Main et Garage si la smoke se dissipe.",
                "Lurker": "Fake contact Squeaky Door ou Lobby."
            },
            callouts=["Outside", "Secret", "Garage", "Main", "Lower Site"],
            pins=[
                {
                    "id": "nuke-pin-1",
                    "x": 62.0,
                    "y": 45.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Outside Cross Smoke #1",
                    "description": "Coupe la vision depuis Garage vers Secret.",
                    "throw_type": "Jumpthrow",
                    "player_role": "IGL"
                },
                {
                    "id": "nuke-pin-2",
                    "x": 68.0,
                    "y": 52.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Outside Deep Smoke #2",
                    "description": "Mur complet pour traverser vers Secret.",
                    "throw_type": "Jumpthrow",
                    "player_role": "Support"
                }
            ]
        ),

        # Anubis
        Strat(
            map_name="Anubis",
            title="B Split - Street Smoke & Connector Flash",
            buy_phase="Full buy",
            side="T-Side",
            category="Execution",
            description="Prise simultanée du site B depuis Main et Connector. Smoke Street pour couper le sniper CT sur Bridge, double flash pour rentrer sur le site.",
            assigned_roles={
                "IGL": "Smoke Street depuis Alley.",
                "Entry": "Push Connector vers B Site.",
                "Support": "Flash Pop au-dessus du pilier B.",
                "AWP / Sniper": "Prend le duel Canal / Middle Water.",
                "Lurker": "Contrôle A Main pour empêcher le flank."
            },
            callouts=["B Site", "Connector", "Street", "Bridge", "Canal"],
            pins=[
                {
                    "id": "anubis-pin-1",
                    "x": 35.0,
                    "y": 55.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Street",
                    "description": "Bloque le crossfire du Bridge vers le site B.",
                    "throw_type": "Jumpthrow",
                    "player_role": "IGL"
                }
            ]
        ),

        # Ancient
        Strat(
            map_name="Ancient",
            title="A Donut Control & Temple Flash Exec",
            buy_phase="Full buy",
            side="T-Side",
            category="Mid Control",
            description="Contrôle Mid agressif avec smoke Donut et prise de Temple. Permet de planter sur le site A avec une couverture totale du côté CT.",
            assigned_roles={
                "IGL": "Smoke CT Spawn depuis Mid.",
                "Entry": "Entry Donut avec flash Support.",
                "Support": "Molotov Temple A.",
                "AWP / Sniper": "Surveillance Middle House.",
                "Lurker": "Prise de B Ramp / Cave."
            },
            callouts=["Donut", "Temple", "Mid", "A Site", "CT Spawn"],
            pins=[
                {
                    "id": "ancient-pin-1",
                    "x": 55.0,
                    "y": 42.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Donut",
                    "description": "Isole le joueur CT positionné dans Donut.",
                    "throw_type": "Jumpthrow",
                    "player_role": "Support"
                }
            ]
        ),

        # Dust II
        Strat(
            map_name="Dust II",
            title="A Long Rush - Corner Flash & Cross Smoke",
            buy_phase="Full buy",
            side="T-Side",
            category="Execution",
            description="Prise éclair de A Long. Double flash par-dessus les portes de Long pour aveugler l'AWP Corner, smoke CT Cross et prise de la rampe pour planter Default A.",
            assigned_roles={
                "IGL": "Smoke CT Cross depuis Long Doors.",
                "Entry": "Premier duel Corner Long avec flash aveuglante.",
                "Support": "Double flash au-dessus du toit de Long.",
                "AWP / Sniper": "Ligne sur A Site et Pit.",
                "Lurker": "Contrôle Under A / Short ou bruit T Spawn."
            },
            callouts=["Long Doors", "Long Corner", "Pit", "A Site", "CT Cross", "A Short"],
            pins=[
                {
                    "id": "dust2-pin-1",
                    "x": 75.0,
                    "y": 45.0,
                    "type": "flash",
                    "side": "T-Side",
                    "title": "Over-Roof Long Flash",
                    "description": "Lancé au-dessus du toit en sortie de Doors.",
                    "throw_type": "Run-throw",
                    "player_role": "Support"
                },
                {
                    "id": "dust2-pin-2",
                    "x": 62.0,
                    "y": 38.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke CT Cross",
                    "description": "Coupe la ligne du sniper CT depuis le spawn.",
                    "throw_type": "Jumpthrow",
                    "player_role": "IGL"
                }
            ]
        ),

        # Vertigo
        Strat(
            map_name="Vertigo",
            title="A Ramp Push - Crane Smoke & Default Molotov",
            buy_phase="Full buy",
            side="T-Side",
            category="Execution",
            description="Prise agressive de la Rampe A au 51e étage. Smoke Right Side / Crane, molotov Sandbags, et prise du site A avec plante couverte sous la grue.",
            assigned_roles={
                "IGL": "Smoke Crane / Right Side depuis T Stairs.",
                "Entry": "Premier contact Ramp avec trade frags immédiats.",
                "Support": "Molotov Default et flash pop au-dessus de la barrière.",
                "AWP / Sniper": "Contrôle les pushs CT Mid.",
                "Lurker": "Pression B Stairs pour retarder la rotation CT."
            },
            callouts=["A Ramp", "Crane", "Sandbags", "A Site", "51st Floor", "Elevator"],
            pins=[
                {
                    "id": "vertigo-pin-1",
                    "x": 65.0,
                    "y": 60.0,
                    "type": "smoke",
                    "side": "T-Side",
                    "title": "Smoke Crane / Right Side",
                    "description": "Isole les défenseurs CT positionnés sous la grue.",
                    "throw_type": "Jumpthrow",
                    "player_role": "IGL"
                }
            ]
        )
    ]

    for s in strats:
        db.add(s)

    db.commit()
    print("[Seed] Playbook tactique CS2 initialisé avec succès pour les 7 cartes !")
