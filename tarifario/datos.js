// ============================================================
//  TARIFARIO DE IMPLANTES - Archivo de Precios Base
//  Datos version 1.2 — Actualizado 30/03/2026
//
//  INSTRUCCIONES:
//  - Edita los valores de "precio" según tus listas de precios
//  - Los precios son en pesos chilenos (CLP), sin puntos ni signos
//  - Ejemplo correcto:  precio: 350000
//  - Ejemplo incorrecto: precio: "$350.000"
//  - Para agregar un ítem nuevo, copia una línea y cámbiala
//  - Para dejarlo en blanco (sin precio definido), usa: precio: 0
//
//  FUENTES:
//  - Neobiotech: Precio Universidad
//  - Neodent: Precio Instituto c/IVA
//  - MIS: Precio Instituto c/IVA
// ============================================================

const TARIFARIO_PRECIOS = {

    // ─────────────────────────────────────────────────────────
    //  NEODENT  (Precios Instituto c/IVA)
    // ─────────────────────────────────────────────────────────
    neodent: [
        { nombre: "Implante Neodent",              precio: 82000 },
        // -- Aditamentos --
        { nombre: "Tornillo de cicatrización",     precio: 19308 },
        { nombre: "Pilar temporal (provisional)",  precio: 27917 },
        { nombre: "Pilar definitivo (stock)",      precio: 34747 },
        { nombre: "Pilar UCLA calcinable",         precio: 11035 },
        { nombre: "Scanbody",                      precio: 20162 },
        { nombre: "Transfer (cubeta abierta)",     precio: 20162 },
        { nombre: "Transfer (cubeta cerrada)",     precio: 20162 },
        { nombre: "Análogo de implante",           precio: 11705 },
        { nombre: "Tapa de cobertura",             precio: 8776  },
        // -- Honorarios y laboratorio --
        { nombre: "Corona sobre implante (lab.)",  precio: 0 },
        { nombre: "Honorarios cirugía implante",   precio: 0 },
    ],

    // ─────────────────────────────────────────────────────────
    //  NEOBIOTECH  (Precios Universidad)
    // ─────────────────────────────────────────────────────────
    neobiotech: [
        { nombre: "Implante Neobiotech",           precio: 63000 },
        // -- Aditamentos --
        { nombre: "Tornillo de cicatrización",     precio: 10000 },
        { nombre: "Pilar temporal (provisional)",  precio: 19800 },
        { nombre: "Pilar definitivo (stock)",      precio: 32400 },
        { nombre: "Pilar UCLA calcinable",         precio: 16200 },
        { nombre: "Scanbody",                      precio: 22500 },
        { nombre: "Transfer (cubeta abierta)",     precio: 19800 },
        { nombre: "Transfer (cubeta cerrada)",     precio: 19800 },
        { nombre: "Análogo de implante",           precio: 10000 },
        { nombre: "Tapa de cobertura",             precio: 0     }, // No en lista
        // -- Honorarios y laboratorio --
        { nombre: "Corona sobre implante (lab.)",  precio: 0 },
        { nombre: "Honorarios cirugía implante",   precio: 0 },
    ],

    // ─────────────────────────────────────────────────────────
    //  MIS IMPLANTS  (Precios Instituto c/IVA)
    // ─────────────────────────────────────────────────────────
    mis: [
        { nombre: "Implante MIS",                  precio: 82000 },
        // -- Aditamentos --
        { nombre: "Tornillo de cicatrización",     precio: 18900 },
        { nombre: "Pilar temporal (provisional)",  precio: 34100 },
        { nombre: "Pilar definitivo (stock)",      precio: 31320 },
        { nombre: "Pilar UCLA calcinable",         precio: 22500 },
        { nombre: "Scanbody",                      precio: 31320 },
        { nombre: "Transfer (cubeta abierta)",     precio: 24300 },
        { nombre: "Transfer (cubeta cerrada)",     precio: 24300 },
        { nombre: "Análogo de implante",           precio: 13140 },
        { nombre: "Tapa de cobertura",             precio: 28600 },
        // -- Honorarios y laboratorio --
        { nombre: "Corona sobre implante (lab.)",  precio: 0 },
        { nombre: "Honorarios cirugía implante",   precio: 0 },
    ],

    // ─────────────────────────────────────────────────────────
    //  REHABILITACIÓN — UNIVERSIDAD
    // ─────────────────────────────────────────────────────────
    universidad: [
        // -- Prótesis Fija --
        { nombre: "Corona Metal-Porcelana",                      precio: 0 },
        { nombre: "Corona Zirconia (CAD/CAM)",                   precio: 0 },
        { nombre: "Corona Acrílica Provisional",                 precio: 0 },
        { nombre: "Carilla de Porcelana",                        precio: 0 },
        { nombre: "Incrustación Inlay/Onlay Cerámica",           precio: 0 },
        { nombre: "Puente de 3 Piezas Porcelana",                precio: 0 },
        { nombre: "Perno Muñón Colado",                          precio: 0 },
        { nombre: "Perno Fibra de Vidrio",                       precio: 0 },
        // -- Prótesis Removible --
        { nombre: "Prótesis Parcial Removible Acrílica",         precio: 0 },
        { nombre: "Prótesis Parcial Removible Esquelética",      precio: 0 },
        { nombre: "Prótesis Total Superior",                     precio: 0 },
        { nombre: "Prótesis Total Inferior",                     precio: 0 },
        { nombre: "Prótesis Total Bimaxilar",                    precio: 0 },
        // -- Implantología --
        { nombre: "Cirugía de implante (arancel universitario)", precio: 0 },
        { nombre: "Corona sobre implante (arancel univ.)",       precio: 0 },
        { nombre: "Injerto óseo",                                precio: 0 },
        // -- Honorarios academia --
        { nombre: "Honorarios supervisión (por sesión)",         precio: 0 },
    ]
};
