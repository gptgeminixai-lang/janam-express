/* The souvenir: a 1080×1350 ticket PNG drawn on canvas — downloadable, WhatsApp-shareable. */

export function buildCaption(j) {
  const lines = [
    `🎟️ I took the Janam Express back to ${j.dateLong}, ${j.bornCity}.`,
    `₹100 that day = ₹${j.valToday} today. Petrol was ₹${j.petrol}.`,
  ];
  if (j.film) lines.push(`${j.film} was in the cinemas.`);
  if (j.wasOldName) lines.push(`And yes — I was born in ${j.oldName.toUpperCase()}, a city that no longer exists on paper.`);
  lines.push(`Book your own ticket → ${location.origin}${location.pathname}?d=${j.iso}&c=${encodeURIComponent(j.city)}`);
  return lines.join('\n');
}

export function drawTicket(j) {
  const W = 1080, H = 1350;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  // night ground
  x.fillStyle = '#151022'; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(239,166,54,.9)';
  x.font = '600 34px "Courier New",monospace';
  x.textAlign = 'center';
  x.letterSpacing = '12px';
  x.fillText('JANAM EXPRESS · TIME-TRAVEL RESERVATION', W / 2, 110);

  // pink Edmondson ticket
  const T = { x: 90, y: 190, w: W - 180, h: 820 };
  x.save();
  x.translate(W / 2, T.y + T.h / 2); x.rotate(-0.018); x.translate(-W / 2, -(T.y + T.h / 2));
  x.fillStyle = '#EFA3B8';
  x.beginPath(); x.roundRect(T.x, T.y, T.w, T.h, 14); x.fill();
  // perforations
  x.fillStyle = '#151022';
  for (let py = T.y + 16; py < T.y + T.h; py += 34) {
    x.beginPath(); x.arc(T.x, py, 9, 0, 7); x.fill();
    x.beginPath(); x.arc(T.x + T.w, py, 9, 0, 7); x.fill();
  }
  const ink = '#4A1226', soft = '#8A3A55';
  x.textAlign = 'left';
  x.fillStyle = ink;
  x.letterSpacing = '8px';
  x.font = '700 44px "Courier New",monospace';
  x.fillText('JANAM EXPRESS', T.x + 60, T.y + 90);
  x.textAlign = 'right';
  x.font = '400 24px "Courier New",monospace';
  x.fillText('SLEEPER · TIME MACHINE', T.x + T.w - 60, T.y + 88);
  x.textAlign = 'left';
  x.strokeStyle = soft; x.lineWidth = 4;
  x.beginPath(); x.moveTo(T.x + 60, T.y + 120); x.lineTo(T.x + T.w - 60, T.y + 120); x.stroke();

  x.letterSpacing = '2px';
  x.font = '400 100px Haettenschweiler,"Arial Narrow",Impact,sans-serif';
  x.fillText(j.bornCity.toUpperCase(), T.x + 60, T.y + 250);
  x.fillText('→ ' + j.dateShort.toUpperCase(), T.x + 60, T.y + 360);

  const meta = [
    ['PASSENGER', j.name.toUpperCase()], ['TRAVELLER NO.', j.ttNo],
    ['DATE OF JOURNEY', j.iso], ['BERTH', j.berth],
  ];
  if (j.station) meta.push(['BOARDING STATION', j.station], ['ZONE', (j.zone || '') + ' RAILWAY']);
  meta.forEach(([k, v], i) => {
    const mx = T.x + 60 + (i % 2) * (T.w / 2 - 40);
    const my = T.y + 440 + Math.floor(i / 2) * 92;
    x.fillStyle = soft; x.letterSpacing = '6px';
    x.font = '400 22px "Courier New",monospace';
    x.fillText(k, mx, my);
    x.fillStyle = ink; x.letterSpacing = '2px';
    x.font = '700 36px "Courier New",monospace';
    x.fillText(v, mx, my + 44);
  });

  // verified stamp
  x.save();
  x.translate(T.x + T.w - 200, T.y + T.h - 90); x.rotate(0.12);
  x.strokeStyle = soft; x.lineWidth = 5;
  x.strokeRect(-160, -40, 330, 74);
  x.fillStyle = soft; x.letterSpacing = '6px';
  x.font = '700 26px "Courier New",monospace';
  x.fillText('TIME TRAVELLED ✓', -140, 8);
  x.restore();
  x.restore();

  // stats under ticket
  x.textAlign = 'center'; x.fillStyle = '#F4E8CE'; x.letterSpacing = '1px';
  x.font = '400 40px Georgia,serif';
  const stats = [
    `₹100 that day  =  ₹${j.valToday} today`,
    `Petrol ₹${j.petrol}/L  ·  Gold ₹${j.gold}/10g`,
    j.film ? `In cinemas: ${j.film}` : '',
  ].filter(Boolean);
  stats.forEach((s, i) => x.fillText(s, W / 2, 1105 + i * 62));

  x.fillStyle = 'rgba(244,232,206,.5)';
  x.font = '400 26px "Courier New",monospace'; x.letterSpacing = '6px';
  x.fillText('THE DAY YOU WERE BORN · INDIA', W / 2, H - 46);
  return cv;
}

export async function ticketBlob(j) {
  return new Promise(res => drawTicket(j).toBlob(res, 'image/png'));
}

export async function shareTicket(j) {
  const blob = await ticketBlob(j);
  const file = new File([blob], `janam-express-${j.iso}.png`, { type: 'image/png' });
  const payload = { files: [file], title: 'Janam Express', text: buildCaption(j) };
  if (navigator.canShare && navigator.canShare(payload)) {
    await navigator.share(payload);
    return true;
  }
  return false;
}

export async function downloadTicket(j) {
  const blob = await ticketBlob(j);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `janam-express-${j.iso}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
