// ============================================================
//  TARIFARIO DE IMPLANTES - Archivo de Precios Base
//  Datos version 1.1 — Actualizar directamente en este archivo
//
//  INSTRUCCIONES:
//  - Edita los valores de "precio" según tus listas de precios
//  - Los precios son en pesos chilenos (CLP), sin puntos ni signos
//  - Ejemplo correcto:  precio: 350000
//  - Ejemplo incorrecto: precio: "$350.000"
//  - Para agregar un ítem nuevo, copia una línea y cámbiala
//  - Para dejarlo en blanco (sin precio definido), usa: precio: 0
// ============================================================

const TARIFARIO_PRECIOS = {

    // ─────────────────────────────────────────────────────────
    //  NEODENT
    // ─────────────────────────────────────────────────────────
    neodent: [
        { nombre: "Implante Neodent",              precio: 0 },
        // -- Aditamentos --
        { nombre: "Tornillo de cicatrización",     precio: 0 },
        { nombre: "Pilar temporal (provisional)",  precio: 0 },
        { nombre: "Pilar definitivo (stock)",      precio: 0 },
        { nombre: "Pilar UCLA calcinable",         precio: 0 },
        { nombre: "Scanbody",                      precio: 0 },
        { nombre: "Transfer (cubeta abierta)",     precio: 0 },
        { nombre: "Transfer (cubeta cerrada)",     precio: 0 },
        { nombre: "Análogo de implante",           precio: 0 },
        { nombre: "Tapa de cobertura",             precio: 0 },
        // -- Honorarios y laboratorio --
        { nombre: "Corona sobre implante (lab.)",  precio: 0 },
        { nombre: "Honorarios cirugía implante",   precio: 0 },
    ],

    // ─────────────────────────────────────────────────────────
    //  NEOBIOTECH
    // ─────────────────────────────────────────────────────────
    neobiotech: [
        { nombre: "Implante Neobiotech",           precio: 0 },
        // -- Aditamentos --
        { nombre: "Tornillo de cicatrización",     precio: 0 },
        { nombre: "Pilar temporal (provisional)",  precio: 0 },
        { nombre: "Pilar definitivo (stock)",      precio: 0 },
        { nombre: "Pilar UCLA calcinable",         precio: 0 },
        { nombre: "Scanbody",                      precio: 0 },
        { nombre: "Transfer (cubeta abierta)",     precio: 0 },
        { nombre: "Transfer (cubeta cerrada)",     precio: 0 },
        { nombre: "Análogo de implante",           precio: 0 },
        { nombre: "Tapa de cobertura",             precio: 0 },
        // -- Honorarios y laboratorio --
        { nombre: "Corona sobre implante (lab.)",  precio: 0 },
        { nombre: "Honorarios cirugía implante",   precio: 0 },
    ],

    // ─────────────────────────────────────────────────────────
    //  MIS IMPLANTS
    // ─────────────────────────────────────────────────────────
    mis: [
        { nombre: "Implante MIS",                  precio: 84000 },
        // -- Aditamentos --
        { nombre: "Tornillo de cicatrización",     precio: 40000 },
        { nombre: "Pilar temporal (provisional)",  precio: 0 },
        { nombre: "Pilar definitivo (stock)",      precio: 32000 },
        { nombre: "Pilar UCLA calcinable",         precio: 40000 },
        { nombre: "Scanbody",                      precio: 0 },
        { nombre: "Transfer (cubeta abierta)",     precio: 0 },
        { nombre: "Transfer (cubeta cerrada)",     precio: 0 },
        { nombre: "Análogo de implante",           precio: 0 },
        { nombre: "Tapa de cobertura",             precio: 0 },
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
