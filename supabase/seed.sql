-- Seed email sequences and sample campaign code
-- Requires migrations 001 + 002 (table `campaign_codes` is created in 002)

insert into email_sequences (name, slug, category_slug, steps, is_active)
values
(
  'Default 7-day nurture',
  'default-nurture',
  null,
  '[
    {"dayOffset": 0, "subject": "Thanks for exploring nature-based OT with us", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Thank you for completing the parent guide. This email is educational and not a clinical evaluation. If you have questions about whether our groups are a good fit, you can <a href=\"{{book_url}}\">schedule a short call</a> with our team.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 1, "subject": "What to expect in outdoor group sessions", "bodyHtml": "<p>Hi {{parent_name}},</p><p>We use nature as a calm, sensory-rich setting for play and practice. We do not guarantee specific outcomes; every child is different. <a href=\"{{book_url}}\">Book a call</a> to learn more.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 2, "subject": "Sensory-friendly tips for home", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Simple routines like outdoor movement breaks can support regulation for many families. This is general information, not individualized therapy advice. <a href=\"{{book_url}}\">Talk with us</a> if you would like to discuss options in Texas.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 3, "subject": "How we support social participation", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Our groups include peer interaction in small, supported settings. We will not promise specific results. <a href=\"{{book_url}}\">Schedule a call</a> to see if the group matches your goals.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 4, "subject": "Motor skills and outdoor play", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Outdoor tasks like balancing, carrying, and climbing can support coordination in a motivating context. This message is educational only. <a href=\"{{book_url}}\">Connect with us</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 5, "subject": "School readiness without pressure", "bodyHtml": "<p>Hi {{parent_name}},</p><p>We focus on foundational skills that often support classroom participation. We do not replace school evaluations. <a href=\"{{book_url}}\">Book a call</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 6, "subject": "Last note from our team", "bodyHtml": "<p>Hi {{parent_name}},</p><p>If you would still like to learn about {{primary_category}} and our Texas groups, we are here. <a href=\"{{book_url}}\">Schedule a call</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"}
  ]'::jsonb,
  true
),
(
  'Sensory regulation — nurture',
  'nurture-sensory-regulation',
  'sensory_regulation',
  '[
    {"dayOffset": 0, "subject": "Your guide highlighted sensory regulation", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Many families notice differences in how children process sights, sounds, and movement. Our outdoor groups offer regulated pacing and nature-based activities. This is not an evaluation. <a href=\"{{book_url}}\">Book a call</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 1, "subject": "Gentle routines that help many kids", "bodyHtml": "<p>Hi {{parent_name}},</p><p>General ideas: predictable transitions, movement before seated tasks, and time outside. Not medical advice. <a href=\"{{book_url}}\">Talk with us</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 2, "subject": "Outdoor sensory richness", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Nature offers varied textures, sounds, and light levels that many children explore comfortably in small groups. <a href=\"{{book_url}}\">Learn more</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 3, "subject": "Peer connection in a calm setting", "bodyHtml": "<p>Hi {{parent_name}},</p><p>We keep groups small and therapist-guided. We do not promise outcomes. <a href=\"{{book_url}}\">Schedule a call</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 4, "subject": "When to seek individualized OT", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Groups complement but do not replace individualized occupational therapy when needed. We can discuss fit on a call.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 5, "subject": "Your questions matter", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Bring your questions about Texas services and our approach — we are transparent about what we offer. <a href=\"{{book_url}}\">Book</a>.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"},
    {"dayOffset": 6, "subject": "We are here if you are ready", "bodyHtml": "<p>Hi {{parent_name}},</p><p>Reply or <a href=\"{{book_url}}\">schedule a call</a> whenever you are ready. No pressure.</p><p><a href=\"{{unsubscribe_url}}\">Unsubscribe</a></p>"}
  ]'::jsonb,
  true
)
on conflict (slug) do nothing;

-- Example referral code for campaigns (optional)
insert into campaign_codes (code, referred_by)
values ('TEXASNATURE2026', 'launch_campaign')
on conflict (code) do nothing;
