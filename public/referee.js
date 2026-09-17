import { state, isFigure } from "\u002E\u002F\u0063\u006F\u006E\u0066\u0069\u0067\u002E\u006A\u0073";
import { stopTimer, startTimer } from "\u002E\u002F\u0074\u0069\u006D\u0065\u0072\u002E\u006A\u0073";
import { actualizarVisualSalaJugadores, resetGame, lanzarFuegosArtificialesCiberpunk } from "\u002E\u002F\u006D\u0061\u0069\u006E\u002E\u006A\u0073";
function _0x_0xg2a(_0xc87c) {
  if (!state['\u0070\u006C\u0061\u0079\u0069\u006E\u0067']) return;
  const _0x2aead = state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073'][state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078']]['\u006E\u0061\u006D\u0065'];
  _0xc87c = 109877 ^ 109878;
  console['\u006C\u006F\u0067'](`🚨 EXCEPCIÓN DE RED: ${_0x2aead['\u0074\u006F\u0055\u0070\u0070\u0065\u0072\u0043\u0061\u0073\u0065']()} no emitió respuesta a tiempo.`);
  state['\u0070\u006C\u0061\u0079\u0065\u0072\u0054\u0061\u0072\u0067\u0065\u0074\u0042\u006C\u006F\u0063\u006B\u0073'][_0x2aead] = [];
  state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078'] = (state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078'] + (470418 ^ 470419)) % state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u006C\u0065\u006E\u0067\u0074\u0068'];
  var _0x4c8d8d = (859409 ^ 859412) + (255115 ^ 255107);
  const _0x48648a = state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073'][state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078']];
  _0x4c8d8d = 868009 ^ 868011;
  actualizarVisualSalaJugadores();
  startTimer();
}
export { _0x_0xg2a as manejarTiempoAgotadoTurno };
function _0xeef9ec(atacante, _0xb17g3b) {
  if (!state['\u0070\u006C\u0061\u0079\u0065\u0072\u0054\u0061\u0072\u0067\u0065\u0074\u0042\u006C\u006F\u0063\u006B\u0073'][atacante]) state['\u0070\u006C\u0061\u0079\u0065\u0072\u0054\u0061\u0072\u0067\u0065\u0074\u0042\u006C\u006F\u0063\u006B\u0073'][atacante] = [];
  const _0x46ef = state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u0066\u0069\u006C\u0074\u0065\u0072'](p => p['\u006E\u0061\u006D\u0065'] !== atacante && !state['\u0064\u0065\u0063\u0072\u0079\u0070\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u0069\u006E\u0063\u006C\u0075\u0064\u0065\u0073'](p['\u006E\u0061\u006D\u0065']))['\u006C\u0065\u006E\u0067\u0074\u0068'];
  _0xb17g3b = (550484 ^ 550484) + (522400 ^ 522406);
  var _0xf61f = (628124 ^ 628120) + (958960 ^ 958961);
  const _0xd23caa = state['\u0070\u006C\u0061\u0079\u0065\u0072\u0054\u0061\u0072\u0067\u0065\u0074\u0042\u006C\u006F\u0063\u006B\u0073'][atacante]['\u0066\u0069\u006C\u0074\u0065\u0072'](targetName => !state['\u0064\u0065\u0063\u0072\u0079\u0070\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u0069\u006E\u0063\u006C\u0075\u0064\u0065\u0073'](targetName))['\u006C\u0065\u006E\u0067\u0074\u0068'];
  _0xf61f = (610716 ^ 610717) + (351719 ^ 351718);
  if (_0xd23caa >= _0x46ef || state['\u0070\u006C\u0061\u0079\u0065\u0072\u0054\u0061\u0072\u0067\u0065\u0074\u0042\u006C\u006F\u0063\u006B\u0073'][atacante]['\u006C\u0065\u006E\u0067\u0074\u0068'] >= state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u006C\u0065\u006E\u0067\u0074\u0068'] - (478873 ^ 478872)) {
    state['\u0070\u006C\u0061\u0079\u0065\u0072\u0054\u0061\u0072\u0067\u0065\u0074\u0042\u006C\u006F\u0063\u006B\u0073'][atacante] = [];
    state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078'] = (state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078'] + (739032 ^ 739033)) % state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u006C\u0065\u006E\u0067\u0074\u0068'];
    let _0x61ff3f;
    const _0x1a63e = state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073'][state['\u0063\u0075\u0072\u0072\u0065\u006E\u0074\u0050\u006C\u0061\u0079\u0065\u0072\u0049\u006E\u0064\u0065\u0078']];
    _0x61ff3f = (505603 ^ 505602) + (463021 ^ 463020);
    console['\u006C\u006F\u0067'](`🔄 FIN DE CICLO: Turno transferido a ${_0x1a63e['\u006E\u0061\u006D\u0065']}`);
    actualizarVisualSalaJugadores();
    startTimer();
  } else {
    console['\u006C\u006F\u0067'](`📡 Nodo atacado con éxito. Reconfigurando reloj para el próximo ataque de ${atacante}.`);
    startTimer();
  }
}
export { _0xeef9ec as finalizarTurnoJugador };
function _0xb47a() {
  var _0xb3fd = (711217 ^ 711219) + (525597 ^ 525598);
  const _0xe3e77d = state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']['\u006C\u0065\u006E\u0067\u0074\u0068'] - (862273 ^ 862272);
  _0xb3fd = (950112 ^ 950117) + (770743 ^ 770750);
  for (let _0xc_0x91c of state['\u0063\u006F\u006E\u006E\u0065\u0063\u0074\u0065\u0064\u0050\u006C\u0061\u0079\u0065\u0072\u0073']) {
    var _0xd19e5a = (522422 ^ 522430) + (594691 ^ 594695);
    const _0xf3489f = state['\u006D\u0075\u006C\u0074\u0069\u0070\u006C\u0061\u0079\u0065\u0072\u0048\u0069\u0073\u0074\u006F\u0072\u0079']['\u0066\u0069\u006C\u0074\u0065\u0072'](item => item['\u0070\u006C\u0061\u0079\u0065\u0072'] === _0xc_0x91c['\u006E\u0061\u006D\u0065'] && item['\u0063\u006F\u0072\u0072\u0065\u0063\u0074'] === state['\u006D\u0075\u006C\u0074\u0069\u004C\u0065\u006E\u0067\u0074\u0068'])['\u006C\u0065\u006E\u0067\u0074\u0068'];
    _0xd19e5a = '\u0062\u0062\u0071\u0070\u0065\u006B';
    if (_0xf3489f === _0xe3e77d) {
      _0xfdba1g(_0xc_0x91c['\u006E\u0061\u006D\u0065']);
      return !![];
    }
  }
  return false;
}
export { _0xb47a as verificarCondicionVictoriaSala };
function _0xfdba1g(ganador) {
  stopTimer();
  state['\u0070\u006C\u0061\u0079\u0069\u006E\u0067'] = false;
  var _0x1dgee = (833246 ^ 833247) + (567439 ^ 567433);
  const _0xcd78gc = document['\u0063\u0072\u0065\u0061\u0074\u0065\u0045\u006C\u0065\u006D\u0065\u006E\u0074']("vid".split("").reverse().join(""));
  _0x1dgee = '\u006C\u0063\u0071\u006B\u006B\u0069';
  _0xcd78gc['\u0063\u006C\u0061\u0073\u0073\u004E\u0061\u006D\u0065'] = "yalrevo".split("").reverse().join("");
  _0xcd78gc['\u0069\u0064'] = "\u0077\u0069\u006E\u004F\u0076\u0065\u0072\u006C\u0061\u0079";
  _0xcd78gc['\u0073\u0074\u0079\u006C\u0065']['\u0062\u0061\u0063\u006B\u0064\u0072\u006F\u0070\u0046\u0069\u006C\u0074\u0065\u0072'] = ")xp01(rulb".split("").reverse().join("");
  var _0xfc_0x2g6 = (628238 ^ 628237) + (818742 ^ 818738);
  const _0xc2_0xg76 = ganador === state['\u0075\u0073\u0065\u0072\u006E\u0061\u006D\u0065'];
  _0xfc_0x2g6 = '\u0068\u006C\u0069\u0070\u0066\u0069';
  var _0xbfb = (428611 ^ 428609) + (369460 ^ 369461);
  const _0xf584f = _0xc2_0xg76 ? "\u0076\u0061\u0072\u0028\u002D\u002D\u006E\u0065\u006F\u006E\u0029" : "\u0076\u0061\u0072\u0028\u002D\u002D\u0064\u0061\u006E\u0067\u0065\u0072\u0029";
  _0xbfb = (110791 ^ 110789) + (874140 ^ 874136);
  const _0x0a4ecb = _0xc2_0xg76 ? "\u0044\u004F\u004D\u0049\u004E\u0041\u0043\u0049\u00D3\u004E\u0020\u0054\u004F\u0054\u0041\u004C\u0020\u0044\u0045\u0020\u004C\u0041\u0020\u0052\u0045\u0044" : "\u0053\u0049\u0053\u0054\u0045\u004D\u0041\u0020\u0043\u004F\u004D\u0050\u0052\u004F\u004D\u0045\u0054\u0049\u0044\u004F";
  _0xcd78gc['\u0069\u006E\u006E\u0065\u0072\u0048\u0054\u004D\u004C'] = `
    <div class="win-card" style="border-color: ${_0xf584f}; box-shadow: 0 0 50px ${_0xf584f}; max-width: 460px;"> 
      <h2 style="color: ${_0xf584f}; text-shadow: 0 0 15px ${_0xf584f}; font-size: 26px;">${_0x0a4ecb}</h2> 
      
      <div style="margin: 20px 0; padding: 15px; background: var(--bg-panel-2); border: 1px solid var(--border); border-radius: 8px;">
        <span style="color: var(--text-dim); display: block; font-size: 11px; letter-spacing: 2px;">HACKER SUPREMO</span>
        <strong style="color: #fff; font-size: 24px; display: block; margin-top: 5px; letter-spacing: 1px; text-shadow: 0 0 8px #fff;">
          ☠️ ${ganador['\u0074\u006F\u0055\u0070\u0070\u0065\u0072\u0043\u0061\u0073\u0065']()} ☠️
        </strong>
      </div>

      <p style="color: var(--text-dim); font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        El nodo central ha sido encriptado de forma permanente. Todos los terminales adversarios fueron neutralizados con éxito.
      </p> 
      
      <button class="primary-btn" id="btnCerrarMulti" style="background: linear-gradient(90deg, ${_0xf584f}, #0b131b); color: #fff; box-shadow: 0 0 15px rgba(255,255,255,0.1);">
        VOLVER AL MODO SELECCIÓN
      </button> 
    </div>`;
  document['\u0062\u006F\u0064\u0079']['\u0061\u0070\u0070\u0065\u006E\u0064\u0043\u0068\u0069\u006C\u0064'](_0xcd78gc);
  document['\u0067\u0065\u0074\u0045\u006C\u0065\u006D\u0065\u006E\u0074\u0042\u0079\u0049\u0064']("\u0062\u0074\u006E\u0043\u0065\u0072\u0072\u0061\u0072\u004D\u0075\u006C\u0074\u0069")['\u0061\u0064\u0064\u0045\u0076\u0065\u006E\u0074\u004C\u0069\u0073\u0074\u0065\u006E\u0065\u0072']("\u0063\u006C\u0069\u0063\u006B", () => {
    resetGame();
    if (el['\u006D\u0075\u006C\u0074\u0069\u0053\u0074\u0061\u0074\u0075\u0073\u0050\u0061\u006E\u0065\u006C']) el['\u006D\u0075\u006C\u0074\u0069\u0053\u0074\u0061\u0074\u0075\u0073\u0050\u0061\u006E\u0065\u006C']['\u0063\u006C\u0061\u0073\u0073\u004C\u0069\u0073\u0074']['\u0061\u0064\u0064']("neddih".split("").reverse().join(""));
    if (el['\u0073\u0074\u0061\u0074\u0075\u0073\u004D\u0075\u006C\u0074\u0069\u004C\u006F\u0067\u0050\u0061\u006E\u0065\u006C']) el['\u0073\u0074\u0061\u0074\u0075\u0073\u004D\u0075\u006C\u0074\u0069\u004C\u006F\u0067\u0050\u0061\u006E\u0065\u006C']['\u0063\u006C\u0061\u0073\u0073\u004C\u0069\u0073\u0074']['\u0061\u0064\u0064']("\u0068\u0069\u0064\u0064\u0065\u006E");
  });
  lanzarFuegosArtificialesCiberpunk();
}
export { _0xfdba1g as ejecutarVictoriaGlobal };
function _0x34aeee(emisor, receptor, codigo) {
  var _0x05c5cd = (689415 ^ 689423) + (292022 ^ 292016);
  const _0x965dc = document['\u0067\u0065\u0074\u0045\u006C\u0065\u006D\u0065\u006E\u0074\u0042\u0079\u0049\u0064']("labolg-euqata-pop".split("").reverse().join(""));
  _0x05c5cd = 794313 ^ 794318;
  if (_0x965dc) _0x965dc['\u0072\u0065\u006D\u006F\u0076\u0065']();
  var _0xc14dfc = (578692 ^ 578693) + (231288 ^ 231280);
  const _0x93g7b = document['\u0063\u0072\u0065\u0061\u0074\u0065\u0045\u006C\u0065\u006D\u0065\u006E\u0074']("vid".split("").reverse().join(""));
  _0xc14dfc = (669125 ^ 669133) + (732714 ^ 732713);
  _0x93g7b['\u0069\u0064'] = "\u0070\u006F\u0070\u002D\u0061\u0074\u0061\u0071\u0075\u0065\u002D\u0067\u006C\u006F\u0062\u0061\u006C";
  _0x93g7b['\u0063\u006C\u0061\u0073\u0073\u004E\u0061\u006D\u0065'] = "pupop-tsacdaorb".split("").reverse().join("");
  var _0x2e_0x23f = (597910 ^ 597919) + (819080 ^ 819073);
  const _0xcge = codigo['\u006D\u0061\u0070'](v => `<div class="log-el ${isFigure(v) ? "\u0066\u0069\u0067" : "mun".split("").reverse().join("")}">${v}</div>`)['\u006A\u006F\u0069\u006E']('');
  _0x2e_0x23f = (477332 ^ 477335) + (838463 ^ 838462);
  _0x93g7b['\u0069\u006E\u006E\u0065\u0072\u0048\u0054\u004D\u004C'] = `
    <div class="broadcast-content">
      <div class="broadcast-header">📡 TRANSMISIÓN DE RED DETECTADA</div>
      <p>El agente <strong style="color:#00f5d4;">${emisor['\u0074\u006F\u0055\u0070\u0070\u0065\u0072\u0043\u0061\u0073\u0065']()}</strong> está inyectando un código en el nodo de <strong style="color:#ff4d6d;">${receptor['\u0074\u006F\u0055\u0070\u0070\u0065\u0072\u0043\u0061\u0073\u0065']()}</strong></p>
      <div class="broadcast-code">${_0xcge}</div>
    </div>
  `;
  document['\u0062\u006F\u0064\u0079']['\u0061\u0070\u0070\u0065\u006E\u0064\u0043\u0068\u0069\u006C\u0064'](_0x93g7b);
  setTimeout(() => {
    _0x93g7b['\u0073\u0074\u0079\u006C\u0065']['\u006F\u0070\u0061\u0063\u0069\u0074\u0079'] = "\u0030";
    _0x93g7b['\u0073\u0074\u0079\u006C\u0065']['\u0074\u0072\u0061\u006E\u0073\u0066\u006F\u0072\u006D'] = "\u0074\u0072\u0061\u006E\u0073\u006C\u0061\u0074\u0065\u0028\u002D\u0035\u0030\u0025\u002C\u0020\u002D\u0036\u0030\u0025\u0029\u0020\u0073\u0063\u0061\u006C\u0065\u0028\u0030\u002E\u0039\u0029";
    setTimeout(() => _0x93g7b['\u0072\u0065\u006D\u006F\u0076\u0065'](), 478881 ^ 479025);
  }, 380478 ^ 378246);
}
export { _0x34aeee as mostrarVentanaFlotanteAtaque };
function _0xf6653e(atacante, objetivo) {
  var _0x40dd = (684541 ^ 684537) + (984874 ^ 984879);
  const _0xg6e = document['\u0063\u0072\u0065\u0061\u0074\u0065\u0045\u006C\u0065\u006D\u0065\u006E\u0074']("\u0064\u0069\u0076");
  _0x40dd = (754726 ^ 754723) + (622818 ^ 622817);
  _0xg6e['\u0063\u006C\u0061\u0073\u0073\u004E\u0061\u006D\u0065'] = "\u0062\u0072\u006F\u0061\u0064\u0063\u0061\u0073\u0074\u002D\u0070\u006F\u0070\u0075\u0070";
  _0xg6e['\u0073\u0074\u0079\u006C\u0065']['\u0062\u006F\u0072\u0064\u0065\u0072\u0043\u006F\u006C\u006F\u0072'] = "\u0076\u0061\u0072\u0028\u002D\u002D\u006E\u0065\u006F\u006E\u002D\u0032\u0029";
  _0xg6e['\u0073\u0074\u0079\u006C\u0065']['\u0062\u006F\u0078\u0053\u0068\u0061\u0064\u006F\u0077'] = "\u0030\u0020\u0030\u0020\u0032\u0035\u0070\u0078\u0020\u0072\u0067\u0062\u0061\u0028\u0032\u0034\u0036\u002C\u0020\u0035\u0035\u002C\u0020\u0032\u0033\u0036\u002C\u0020\u0030\u002E\u0036\u0029";
  _0xg6e['\u0073\u0074\u0079\u006C\u0065']['\u0070\u006F\u0069\u006E\u0074\u0065\u0072\u0045\u0076\u0065\u006E\u0074\u0073'] = "\u0061\u0075\u0074\u006F";
  _0xg6e['\u0069\u006E\u006E\u0065\u0072\u0048\u0054\u004D\u004C'] = `
    <div class="broadcast-content">
      <div class="broadcast-header" style="color: var(--neon-2); letter-spacing: 3px;">🎯 NODO COMPROMETIDO 🎯</div>
      <p style="margin-top: 10px; font-size: 14px;">
        El hacker <strong style="color: var(--neon); font-size: 16px;">${atacante['\u0074\u006F\u0055\u0070\u0070\u0065\u0072\u0043\u0061\u0073\u0065']()}</strong> 
        ha quebrado la seguridad de <strong style="color: var(--danger); font-size: 16px;">${objetivo['\u0074\u006F\u0055\u0070\u0070\u0065\u0072\u0043\u0061\u0073\u0065']()}</strong>.
      </p>
      <div style="margin-top: 15px; color: var(--text-dim); font-size: 11px;">El objetivo ha sido desconectado de la red.</div>
    </div>
  `;
  document['\u0062\u006F\u0064\u0079']['\u0061\u0070\u0070\u0065\u006E\u0064\u0043\u0068\u0069\u006C\u0064'](_0xg6e);
  setTimeout(() => {
    _0xg6e['\u0073\u0074\u0079\u006C\u0065']['\u006F\u0070\u0061\u0063\u0069\u0074\u0079'] = "\u0030";
    _0xg6e['\u0073\u0074\u0079\u006C\u0065']['\u0074\u0072\u0061\u006E\u0073\u0066\u006F\u0072\u006D'] = "\u0074\u0072\u0061\u006E\u0073\u006C\u0061\u0074\u0065\u0028\u002D\u0035\u0030\u0025\u002C\u0020\u002D\u0036\u0030\u0025\u0029\u0020\u0073\u0063\u0061\u006C\u0065\u0028\u0030\u002E\u0039\u0029";
    setTimeout(() => _0xg6e['\u0072\u0065\u006D\u006F\u0076\u0065'](), 287665 ^ 287265);
  }, 724860 ^ 721616);
}
export { _0xf6653e as celebrarDescifradoIntermedio };