# Calculadora RPN - Progressive Web App

Calculadora con notación polaca inversa (RPN) estilo HP, implementada como Progressive Web App.

## Características

- **Pila de 100 entradas** con visualización de 5 niveles
- **Operaciones aritméticas básicas**: suma, resta, multiplicación y división
- **Funciones especiales**:
  - ENTER: Introduce valor en la pila
  - DROP: Elimina el último valor
  - SWAP: Intercambia los dos últimos valores
  - +/−: Cambia el signo del número
  - C: Limpia la entrada o toda la pila
- **Soporte de teclado**: Números, operadores, Enter, Escape, Backspace, S (swap)
- **Diseño moderno** con botones redondos y colores vibrantes
- **PWA completa**: Instalable y funciona offline
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Cómo usar

### Instalación

1. Abre `index.html` en un navegador web
2. Para generar los iconos, abre `generate-icons.html` y descarga los iconos
3. Coloca los iconos descargados en la carpeta raíz

### Uso como PWA

1. Abre la aplicación en un navegador compatible (Chrome, Edge, Safari)
2. Busca la opción "Instalar" o el prompt de instalación
3. Una vez instalada, podrás acceder desde tu escritorio o pantalla de inicio

### Operaciones básicas

La notación polaca inversa funciona así:
1. Introduce el primer número y presiona ENTER
2. Introduce el segundo número
3. Presiona el operador (+, −, ×, ÷)

**Ejemplo**: Para calcular 5 + 3:
- Escribe `5` → ENTER
- Escribe `3`
- Presiona `+`
- Resultado: `8`

## Arquitectura y Funcionamiento

### Máquina de Estados de Entrada

La calculadora implementa una máquina de estados para gestionar la entrada de números y operaciones:

```mermaid
stateDiagram-v2
    [*] --> Reposo: Inicio

    Reposo --> EntrandoNumero: Dígito (0-9)
    Reposo --> EntrandoNumero: Decimal (.)
    Reposo --> Reposo: ENTER (duplica X)
    Reposo --> Reposo: Operador
    Reposo --> Reposo: DROP/SWAP/C

    EntrandoNumero --> EntrandoNumero: Dígito (0-9)
    EntrandoNumero --> EntrandoNumero: Decimal (.)
    EntrandoNumero --> EntrandoNumero: +/− (negar)
    EntrandoNumero --> Reposo: ENTER (push)
    EntrandoNumero --> Reposo: Operador (push y opera)
    EntrandoNumero --> Reposo: C (cancela entrada)

    state Reposo {
        [*] --> MostrarPila
        MostrarPila --> MostrarPila: Actualizar display
    }

    state EntrandoNumero {
        [*] --> ConstruyendoBuffer
        ConstruyendoBuffer --> ConstruyendoBuffer: Concatenar dígitos
    }
```

### Flujo de Operaciones

```mermaid
flowchart TD
    A[Usuario presiona tecla] --> B{Tipo de entrada}

    B -->|Dígito 0-9| C[Agregar a buffer]
    B -->|Decimal| D[Agregar punto decimal]
    B -->|ENTER| E{¿Entrando número?}
    B -->|Operador| F{¿Entrando número?}
    B -->|Función| G[Ejecutar función]

    C --> H[Actualizar display de entrada]
    D --> H

    E -->|Sí| I[Push buffer a pila]
    E -->|No| J[Duplicar X en pila]
    I --> K[Limpiar buffer]
    J --> L[Actualizar display]
    K --> L

    F -->|Sí| M[Push buffer primero]
    F -->|No| N[Usar valor actual]
    M --> O[Ejecutar operación]
    N --> O

    O --> P{¿Hay suficientes<br/>operandos?}
    P -->|Sí| Q[Pop dos valores]
    P -->|No| R[Mostrar error]

    Q --> S[Calcular resultado]
    S --> T[Push resultado]
    T --> L
    R --> L

    G --> U{Tipo función}
    U -->|DROP| V[Pop un valor]
    U -->|SWAP| W[Intercambiar X e Y]
    U -->|CLEAR| X[Limpiar todo]
    U -->|+/-| Y[Negar número]

    V --> L
    W --> L
    X --> L
    Y --> L

    H --> L
    L --> Z[Fin]
```

### Estructura de la Pila

La calculadora mantiene una pila de 100 elementos y visualiza los 5 superiores:

```mermaid
graph TB
    subgraph Display["Visualización (5 niveles)"]
        T["Nivel 4 (T)"]
        Z["Nivel 3 (Z)"]
        Y["Nivel 2 (Y)"]
        X["Nivel 1 (X)"]
        Input["Entrada Actual"]
    end

    subgraph Stack["Pila Interna (Array 100)"]
        S0["stack[99]"]
        S1["..."]
        S2["stack[stackPointer-1] → X"]
        S3["stack[stackPointer-2] → Y"]
        S4["stack[stackPointer-3] → Z"]
        S5["stack[stackPointer-4] → T"]
        S6["stack[0]"]
    end

    S2 -.-> X
    S3 -.-> Y
    S4 -.-> Z
    S5 -.-> T
```

### Operaciones Aritméticas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant I as Input Handler
    participant S as Stack
    participant O as Operator
    participant D as Display

    Note over U,D: Ejemplo: 5 + 3

    U->>I: Presiona "5"
    I->>D: Muestra "5" en entrada

    U->>I: Presiona ENTER
    I->>S: Push(5)
    S->>D: Actualiza pila [5]

    U->>I: Presiona "3"
    I->>D: Muestra "3" en entrada

    U->>I: Presiona "+"
    I->>S: Push(3)
    S->>D: Actualiza pila [5,3]

    I->>O: Ejecutar suma
    O->>S: b = Pop() → 3
    O->>S: a = Pop() → 5
    O->>O: resultado = 5 + 3 = 8
    O->>S: Push(8)
    S->>D: Actualiza pila [8]
    D->>U: Muestra resultado: 8
```

### Ciclo de Vida de la PWA

```mermaid
stateDiagram-v2
    [*] --> Cargando: Usuario abre app

    Cargando --> Registrando: DOM cargado
    Registrando --> Instalable: Service Worker OK
    Registrando --> Error: Service Worker falla

    Instalable --> Instalando: Usuario acepta instalación
    Instalable --> EnLinea: Usuario continúa en navegador

    Instalando --> Instalada: Instalación exitosa

    Instalada --> Standalone: App abierta desde icono
    EnLinea --> EnLinea: Navegando

    Standalone --> Offline: Sin conexión
    EnLinea --> Offline: Sin conexión

    Offline --> Standalone: Conexión restaurada
    Offline --> EnLinea: Conexión restaurada

    Error --> Cargando: Recarga página
```

### Arquitectura de Componentes

```mermaid
graph LR
    subgraph Frontend["Frontend (index.html)"]
        UI[UI Components]
        SD[Stack Display]
        ID[Input Display]
        BTN[Buttons]
    end

    subgraph Logic["Lógica (app.js)"]
        RPN[RPNCalculator Class]
        Stack[Stack Management]
        Ops[Operations Handler]
        KB[Keyboard Handler]
    end

    subgraph PWA["PWA Infrastructure"]
        SW[Service Worker]
        Cache[Cache Storage]
        Manifest[Manifest.json]
    end

    UI --> RPN
    SD --> RPN
    ID --> RPN
    BTN --> RPN

    RPN --> Stack
    RPN --> Ops
    RPN --> KB

    Stack -.-> SD
    Stack -.-> ID

    SW --> Cache
    Manifest --> SW

    BTN -.->|Events| Ops
    KB -.->|Events| Ops
```

## Tecnologías

- HTML5
- CSS3 (con diseño moderno y gradientes)
- JavaScript ES6+ (Clases, Service Workers)
- PWA (Service Worker, Manifest)

## Estructura del proyecto

```
calc-polaca/
├── index.html              # Estructura principal
├── styles.css              # Estilos modernos
├── app.js                  # Lógica de la calculadora
├── manifest.json           # Configuración PWA
├── service-worker.js       # Service Worker para offline
├── generate-icons.html     # Generador de iconos
├── icon-192.png           # Icono 192x192
├── icon-512.png           # Icono 512x512
└── README.md              # Este archivo
```

## Desarrollo

Para servir la aplicación localmente, puedes usar cualquier servidor HTTP simple:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Licencia

MIT License
