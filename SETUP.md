# Soak N Wet — Form-to-SMS Setup

End-to-end wiring so every contact form submission lands on Pierre's phone within 30 seconds, formatted to be readable from the lock screen, with a copy also going to Yosef for agency visibility.

**Architecture (current, post-Apr-22 build):**

```
Visitor fills contact.html
    └─> POST JSON to /api/submit  (Vercel serverless function)
            └─> Twilio Messages API
                    ├─> SMS to Pierre  (primary)
                    └─> SMS to Yosef   (secondary, same payload)
```

No Formspree. No carrier email-to-SMS gateway. No Make scenario. The serverless function does the formatting and the dispatch.

---

## What you need before you start

1. A Twilio account with a payment method on file (free trial works for verified-only testing, but production needs a small top-up to allow sending to unverified Canadian numbers).
2. The Vercel project for `soak-n-wet` already deployed and wired to the GitHub repo.
3. Pierre's cell phone number (collected at the Apr 22 meeting).

---

## Step 1 — Twilio account + US local number (~10 min, ~US$1.15/mo)

**IMPORTANT (Apr 27 decision):** Buy a US local number, NOT Canadian. Canadian numbers on Twilio require a Regulatory Bundle (1-3 day approval). US numbers are instant. US-to-Canada SMS does NOT require A2P 10DLC because A2P is enforced by US carriers for messages TO US numbers. Pierre and Yosef are on Canadian carriers, so we are clear. Ignore Twilio's "register your A2P brand" nag banners.

1. Sign up at twilio.com. Use the Kollaborate Gmail. Verify your own cell so the trial activates.
2. Add Pierre's cell as a verified caller-ID (trial-mode requirement before sending to him). Twilio will call Pierre with a 6-digit code. Be on the phone with Pierre during this step so he can read it back to you. Skip if you've already topped up to convert out of trial (then any number is reachable).
3. Buy a US local number:
   - Console → Phone Numbers → Buy a Number
   - Country: United States
   - Capabilities: SMS only (voice/MMS not needed)
   - Area code: any. Cost: ~US$1.15/mo. Confirm.
4. Top up the Twilio balance with US$20. This converts the trial into a paid account, removes the trial banner from outgoing messages, and lets you send to any unverified Canadian number (i.e., Pierre's phone without the verified-caller-ID dance from step 2).
5. Copy these three values from the Twilio console (Account → API keys & tokens):
   - `Account SID`
   - `Auth Token` (click "View" to reveal)
   - The phone number you just bought (in E.164: `+1xxxxxxxxxx`)

---

## Step 2 — Set the env vars in Vercel (~3 min)

1. Vercel dashboard → `soak-n-wet` project → Settings → Environment Variables.
2. Add four variables, all scoped to `Production` and `Preview`:

   | Name | Value |
   |---|---|
   | `TWILIO_ACCOUNT_SID` | `AC...` from Twilio |
   | `TWILIO_AUTH_TOKEN` | the auth token from Twilio |
   | `TWILIO_FROM_NUMBER` | the number you bought, e.g. `+16135551234` |
   | `RECIPIENT_PHONE` | comma-separated. Format: `+1<Pierre>,+1<Yosef>` |

3. Important — the recipient list is **comma-separated, no spaces, E.164 only**:
   ```
   +16135550123,+15145550456
   ```
   First number is primary (Pierre). Second is the agency CC (Yosef).

4. Trigger a redeploy so the new env vars take effect:
   - Deployments tab → latest deployment → ⋯ menu → Redeploy. **Uncheck** "Use existing Build Cache" so the function picks up the new vars cleanly.

---

## Step 3 — Smoke test (~5 min)

Two ways. Use the live one.

### Option A (preferred) — submit the real form
1. Open the live site in an incognito window.
2. Fill out the contact form with realistic data: your own name, your own cell as the phone, "Pool or Hot Tub Fill" as the service, "Kanata" as the location, today as the timing, a one-sentence message.
3. Submit. The success panel should appear within 2 seconds.
4. Both phones (Pierre's and Yosef's) should receive an SMS within ~30 seconds.

### Option B — curl the function directly
```bash
curl -X POST https://soaknwet.ca/api/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Run",
    "phone": "6135550123",
    "email": "test@example.com",
    "service": "Pool or Hot Tub Fill",
    "location": "Kanata",
    "timing": "Today / Same Day",
    "volume": "Standard pool (20,000-40,000L)",
    "message": "Smoke test from setup, ignore."
  }'
```
Expected: `{"ok":true}` and an SMS arriving within 30 seconds.

### What the SMS should look like

```
🚰 Soak N Wet lead — Test Run (613) 555-0123
Pool or Hot Tub Fill · Kanata · Today / Same Day

Volume: Standard pool (20,000-40,000L)
Email: test@example.com

"Smoke test from setup, ignore."

Submitted Wed Apr 22, 6:42 PM ET
```

The first line is engineered to fit in an iPhone lock-screen preview: brand + name + tap-to-call phone number.

---

## Step 4 — Swap the recipient to Pierre (post-meeting Apr 22)

Until the meeting, set `RECIPIENT_PHONE` to Yosef's number only. After the meeting, update it to:

```
+1<Pierre's 10 digits>,+1<Yosef's 10 digits>
```

Save → Vercel auto-redeploys → smoke-test once more from the live form using your phone, confirm both Pierre and Yosef receive the SMS.

Send Pierre a one-line text after he's confirmed receipt:
> SMS forwarding is live. Every contact form submission now hits your phone within 30 seconds. Try it from soaknwet.ca anytime — fill it out with fake info and you should get a text.

---

## Troubleshooting

- **No SMS arrived.** Check Vercel → Project → Functions → `/api/submit` logs. The function logs the recipient list and any Twilio error message.
- **`Server misconfigured` returned.** One of the four env vars is missing or empty. Re-check the Vercel env var page and trigger a redeploy.
- **`Method not allowed`.** You hit `/api/submit` with GET. Form posts use POST.
- **Twilio error "unverified number".** Trial accounts can only text verified numbers. Top up the balance to convert to paid.
- **Twilio error "invalid From".** `TWILIO_FROM_NUMBER` must be the exact number you bought, in E.164 (`+1...`).
- **Form looks stuck on "Sending…".** Check browser devtools → Network tab → `/api/submit`. The response body will say what failed.
- **SMS arrives but missing fields.** The form's `name=""` attributes must match what `submit.js` reads (`name`, `phone`, `email`, `service`, `location`, `timing`, `volume`, `message`). Don't rename without updating both sides.

---

## Cost expectations

For 30 form submissions per month:

| Item | Cost |
|---|---|
| Twilio US number (rental) | US$1.15/mo |
| 30 SMS × 2 recipients = 60 messages, US → CA | ~US$0.45 (roughly US$0.0075/msg outbound to Canada, more if emoji forces multi-segment) |
| **Total** | **~US$1.60/mo (~CA$2.20/mo)** |

This rolls into the agency overhead. Don't itemize to Pierre.

---

## What's NOT in this setup yet

These are weekend-after-launch jobs, not blockers for tonight:

- **Google Sheet append.** Every lead also rows-in to a Google Sheet for the monthly retainer review. Layer 2 in `agency/Clients/Active/Soak N Wet/lead-tracking.md` describes this — Make scenario with Sheets append + optional Gmail copy. Add once Twilio direct is verified clean for a week.
- **After-hours routing.** Currently every lead pages Pierre 24/7. Once volume builds, gate the SMS to 6am–10pm and email-only outside that.
- **Auto-reply to the lead.** Send the visitor a "Thanks, we got it, back to you shortly" SMS via the same Twilio number. Strong retainer value-add. Do once Pierre is paying retainer.
