-- Data for "auth"."users"
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "confirmed_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES ('00000000-0000-0000-0000-000000000000', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', 'authenticated', 'authenticated', 'ibutun333@cybersense.local', '$2a$06$UnlRx.hR69eQCsb0r0z3tOOQ04aVE3mS1CAHHc/NhpO0Eu71yXxfu', '2026-05-17T15:36:48.393Z', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-29T10:58:51.619Z', '{"provider":"email","providers":["email"]}', '{"name":"Ismail Butun","username":"ibutun333"}', false, '2026-05-17T15:36:48.393Z', '2026-06-29T10:58:51.645Z', NULL, NULL, '', '', NULL, '2026-05-17T15:36:48.393Z', '', 0, NULL, '', NULL, false, NULL, false) ON CONFLICT DO NOTHING;

-- Data for "auth"."identities"
INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "email", "id") VALUES ('7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '{"sub":"7a4fe8f2-1b97-47a5-88ee-ceeaa567463d","email":"ibutun333@cybersense.local","email_verified":true,"phone_verified":false}', 'email', '2026-05-17T15:36:48.393Z', '2026-05-17T15:36:48.393Z', '2026-05-17T15:36:48.393Z', 'ibutun333@cybersense.local', '8a52fcb0-6723-453c-bc17-2d804cf521c1') ON CONFLICT DO NOTHING;

-- Data for "auth"."sessions"
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('76d2aee1-ec47-47a3-ae3a-186b2ee805dc', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-05-17T15:38:03.345Z', '2026-05-17T15:38:03.345Z', NULL, 'aal1', NULL, NULL, 'node', '176.238.14.68', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('5bdc8a0e-6338-4a77-80e3-0ff284e0a910', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-05-17T15:38:24.201Z', '2026-05-17T15:38:24.201Z', NULL, 'aal1', NULL, NULL, 'node', '176.238.14.68', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('13c72606-d012-4f1b-ae06-7638fd775e47', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-05-17T15:39:02.531Z', '2026-05-17T15:39:02.531Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '176.238.14.68', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('b57690cc-c848-447e-b3ca-48235ec21769', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-05-17T16:38:29.402Z', '2026-05-17T16:38:29.402Z', NULL, 'aal1', NULL, NULL, 'node', '176.238.14.68', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('5bbc315a-a657-4772-8ac6-efc4c734bc7a', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-05-18T12:16:05.925Z', '2026-05-18T12:16:05.925Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '176.238.14.68', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('983238e7-83bb-43ac-a6c2-3aace5e109d0', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-05-21T11:57:21.110Z', '2026-05-21T11:57:21.110Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '78.164.250.23', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('85a940b7-8ec9-4b57-9d2c-6616289ff46d', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-02T13:04:51.685Z', '2026-06-02T13:04:51.685Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/148.0.7778.166 Mobile/15E148 Safari/604.1', '176.55.30.232', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('159550f5-eba9-4d25-8032-754449577392', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-03T10:43:31.157Z', '2026-06-03T10:43:31.157Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '212.2.212.129', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('278f4361-67da-4e5a-8056-fe2d7333eb0b', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-02T13:01:33.969Z', '2026-06-19T07:08:23.069Z', NULL, 'aal1', NULL, '2026-06-19T04:08:23.068Z', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '194.27.197.188', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('a6b24baf-e092-40ae-9a6a-c060f18fc948', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-24T11:27:07.065Z', '2026-06-24T14:33:36.434Z', NULL, 'aal1', NULL, '2026-06-24T11:33:36.434Z', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '194.27.238.149', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('ce493d49-42cc-4237-8406-1e53417342b8', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-25T13:33:18.327Z', '2026-06-25T13:33:18.327Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '194.27.238.149', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('f097045e-7f4c-4449-bfe1-a7f27cddda71', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-29T08:08:56.725Z', '2026-06-29T08:08:56.725Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '194.27.198.105', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('1a9da4cb-b236-4572-b82f-d13952ff97b8', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-29T08:20:04.361Z', '2026-06-29T08:20:04.361Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '194.27.198.105', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('17dd260e-ccb4-42d1-a396-0acad749fcd0', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-29T10:30:45.259Z', '2026-06-29T10:30:45.259Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '194.27.198.105', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES ('388a58c5-a0f3-47bb-9615-104b42066e68', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', '2026-06-29T10:58:51.620Z', '2026-06-29T10:58:51.620Z', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '194.27.242.193', NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;

-- Data for "auth"."refresh_tokens"
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '1', 'mo6xvoqknvmc', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-05-17T15:38:03.359Z', '2026-05-17T15:38:03.359Z', NULL, '76d2aee1-ec47-47a3-ae3a-186b2ee805dc') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '2', 'jf5hff5s5a3l', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-05-17T15:38:24.202Z', '2026-05-17T15:38:24.202Z', NULL, '5bdc8a0e-6338-4a77-80e3-0ff284e0a910') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '3', 'kwksz7x43ztc', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-05-17T15:39:02.532Z', '2026-05-17T15:39:02.532Z', NULL, '13c72606-d012-4f1b-ae06-7638fd775e47') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '4', 'abmyqrdrie76', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-05-17T16:38:29.422Z', '2026-05-17T16:38:29.422Z', NULL, 'b57690cc-c848-447e-b3ca-48235ec21769') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '5', 'jgv76qrnfef4', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-05-18T12:16:05.949Z', '2026-05-18T12:16:05.949Z', NULL, '5bbc315a-a657-4772-8ac6-efc4c734bc7a') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '11', 'mr7fsk77i57b', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-05-21T11:57:21.141Z', '2026-05-21T11:57:21.141Z', NULL, '983238e7-83bb-43ac-a6c2-3aace5e109d0') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '13', 'itksztnbl5vb', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-02T13:04:51.697Z', '2026-06-02T13:04:51.697Z', NULL, '85a940b7-8ec9-4b57-9d2c-6616289ff46d') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '12', '4m6257a7rzgd', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-02T13:01:34.003Z', '2026-06-02T14:59:34.880Z', NULL, '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '14', '5r4pcjhmrfd2', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-02T14:59:34.903Z', '2026-06-03T06:14:59.617Z', '4m6257a7rzgd', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '16', 'l7gkbi7b6huo', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-03T10:43:31.195Z', '2026-06-03T10:43:31.195Z', NULL, '159550f5-eba9-4d25-8032-754449577392') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '15', 'aqcgnp6mkhys', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-03T06:14:59.636Z', '2026-06-04T12:40:17.098Z', '5r4pcjhmrfd2', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '17', 'vg6xmcfba7aw', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-04T12:40:17.121Z', '2026-06-12T07:35:38.705Z', 'aqcgnp6mkhys', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '18', 'etkmalw5vgwj', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-12T07:35:38.719Z', '2026-06-15T07:52:58.657Z', 'vg6xmcfba7aw', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '19', 'flxhg2seppx4', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-15T07:52:58.680Z', '2026-06-15T09:08:19.576Z', 'etkmalw5vgwj', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '20', '4lnnliibzaee', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-15T09:08:19.581Z', '2026-06-15T10:45:32.861Z', 'flxhg2seppx4', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '21', 'farqp57vjr75', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-15T10:45:32.869Z', '2026-06-19T07:08:23.019Z', '4lnnliibzaee', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '22', 't2fyb3dylxzl', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-19T07:08:23.040Z', '2026-06-19T07:08:23.040Z', 'farqp57vjr75', '278f4361-67da-4e5a-8056-fe2d7333eb0b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '23', 'x3s464lbrxbn', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', true, '2026-06-24T11:27:07.103Z', '2026-06-24T14:33:36.398Z', NULL, 'a6b24baf-e092-40ae-9a6a-c060f18fc948') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '24', 'giwxgtv6sjqg', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-24T14:33:36.414Z', '2026-06-24T14:33:36.414Z', 'x3s464lbrxbn', 'a6b24baf-e092-40ae-9a6a-c060f18fc948') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '25', 'nm7q4cseearh', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-25T13:33:18.366Z', '2026-06-25T13:33:18.366Z', NULL, 'ce493d49-42cc-4237-8406-1e53417342b8') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '26', 'hir2gpnrf5el', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-29T08:08:56.753Z', '2026-06-29T08:08:56.753Z', NULL, 'f097045e-7f4c-4449-bfe1-a7f27cddda71') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '27', 'fzxj3ae6duxq', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-29T08:20:04.388Z', '2026-06-29T08:20:04.388Z', NULL, '1a9da4cb-b236-4572-b82f-d13952ff97b8') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '28', 'ped2svibbr7i', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-29T10:30:45.282Z', '2026-06-29T10:30:45.282Z', NULL, '17dd260e-ccb4-42d1-a396-0acad749fcd0') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES ('00000000-0000-0000-0000-000000000000', '29', 'jqnkvsurqsxw', '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', false, '2026-06-29T10:58:51.642Z', '2026-06-29T10:58:51.642Z', NULL, '388a58c5-a0f3-47bb-9615-104b42066e68') ON CONFLICT DO NOTHING;

-- Data for "auth"."mfa_amr_claims"
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('76d2aee1-ec47-47a3-ae3a-186b2ee805dc', '2026-05-17T15:38:03.373Z', '2026-05-17T15:38:03.373Z', 'password', 'df9ee210-2956-41e6-9bd6-6fad5bf58a73') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('5bdc8a0e-6338-4a77-80e3-0ff284e0a910', '2026-05-17T15:38:24.203Z', '2026-05-17T15:38:24.203Z', 'password', 'ad7dfa75-7a5f-46a3-8fbf-8504d58f3974') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('13c72606-d012-4f1b-ae06-7638fd775e47', '2026-05-17T15:39:02.533Z', '2026-05-17T15:39:02.533Z', 'password', '732a7a8d-a9a7-4f4e-81ef-bbfb152dbb89') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('b57690cc-c848-447e-b3ca-48235ec21769', '2026-05-17T16:38:29.439Z', '2026-05-17T16:38:29.439Z', 'password', '2521b0d9-2ed6-4a6e-b2d5-6aa0b47070eb') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('5bbc315a-a657-4772-8ac6-efc4c734bc7a', '2026-05-18T12:16:05.966Z', '2026-05-18T12:16:05.966Z', 'password', 'b01e2c34-7ea5-40d8-b081-43b38e0f8bdf') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('983238e7-83bb-43ac-a6c2-3aace5e109d0', '2026-05-21T11:57:21.178Z', '2026-05-21T11:57:21.178Z', 'password', '290bf89a-b6fe-40e0-83c7-c8f926cf3c92') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('278f4361-67da-4e5a-8056-fe2d7333eb0b', '2026-06-02T13:01:34.035Z', '2026-06-02T13:01:34.035Z', 'password', '38658b73-5a05-4b40-9444-7ea0c67b2363') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('85a940b7-8ec9-4b57-9d2c-6616289ff46d', '2026-06-02T13:04:51.702Z', '2026-06-02T13:04:51.702Z', 'password', '411e3b2f-29e4-465f-985f-29f7c5c84031') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('159550f5-eba9-4d25-8032-754449577392', '2026-06-03T10:43:31.230Z', '2026-06-03T10:43:31.230Z', 'password', '4f8ab2df-8f3a-42f6-b0ac-ea704a07718a') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('a6b24baf-e092-40ae-9a6a-c060f18fc948', '2026-06-24T11:27:07.145Z', '2026-06-24T11:27:07.145Z', 'password', 'e002fe24-d192-4f54-ab9f-c574a4c0446b') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('ce493d49-42cc-4237-8406-1e53417342b8', '2026-06-25T13:33:18.402Z', '2026-06-25T13:33:18.402Z', 'password', '3021949c-2471-4b1d-984f-b62ae95674a7') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('f097045e-7f4c-4449-bfe1-a7f27cddda71', '2026-06-29T08:08:56.784Z', '2026-06-29T08:08:56.784Z', 'password', '8dc7d450-1064-4ff0-a4d3-5634a36f64c4') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('1a9da4cb-b236-4572-b82f-d13952ff97b8', '2026-06-29T08:20:04.398Z', '2026-06-29T08:20:04.398Z', 'password', '1335165a-5c26-4743-b356-ace973a97aed') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('17dd260e-ccb4-42d1-a396-0acad749fcd0', '2026-06-29T10:30:45.300Z', '2026-06-29T10:30:45.300Z', 'password', 'd840eca5-719c-4f16-ba05-d2904392e042') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES ('388a58c5-a0f3-47bb-9615-104b42066e68', '2026-06-29T10:58:51.647Z', '2026-06-29T10:58:51.647Z', 'password', '799749c1-c4ca-4460-ad46-80eb2a51d502') ON CONFLICT DO NOTHING;

-- Data for "storage"."buckets"
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('content-images', 'content-images', NULL, '2026-05-17T17:07:21.525Z', '2026-05-17T17:07:21.525Z', true, false, '5242880', '["image/jpeg","image/jpg","image/png","image/gif","image/webp","image/avif"]', NULL, 'STANDARD') ON CONFLICT DO NOTHING;

-- Data for "public"."admin_users"
INSERT INTO "public"."admin_users" ("user_id", "display_name", "is_active", "created_at", "updated_at") VALUES ('7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', 'Ismail Butun', true, '2026-05-17T15:36:48.393Z', '2026-05-17T15:36:48.393Z') ON CONFLICT DO NOTHING;

-- Data for "auth"."schema_migrations"
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20171026211738') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20171026211808') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20171026211834') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20180103212743') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20180108183307') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20180119214651') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20180125194653') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('00') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20210710035447') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20210722035447') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20210730183235') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20210909172000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20210927181326') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20211122151130') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20211124214934') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20211202183645') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220114185221') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220114185340') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220224000811') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220323170000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220429102000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220531120530') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220614074223') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20220811173540') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221003041349') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221003041400') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221011041400') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221020193600') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221021073300') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221021082433') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221027105023') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221114143122') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221114143410') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221125140132') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221208132122') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221215195500') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221215195800') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20221215195900') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230116124310') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230116124412') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230131181311') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230322519590') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230402418590') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230411005111') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230508135423') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230523124323') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230818113222') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20230914180801') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20231027141322') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20231114161723') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20231117164230') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240115144230') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240214120130') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240306115329') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240314092811') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240427152123') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240612123726') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240729123726') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240802193726') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20240806073726') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20241009103726') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250717082212') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250731150234') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250804100000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250901200500') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250903112500') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250904133000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20250925093508') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20251007112900') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20251104100000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20251111201300') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20251201000000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20260115000000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20260121000000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20260219120000') ON CONFLICT DO NOTHING;
INSERT INTO "auth"."schema_migrations" ("version") VALUES ('20260302000000') ON CONFLICT DO NOTHING;

-- Data for "storage"."migrations"
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (0, 'create-migrations-table', 'e18db593bcde2aca2a408c4d1100f6abba2195df', '2026-05-16T14:07:35.934Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (1, 'initialmigration', '6ab16121fbaa08bbd11b712d05f358f9b555d777', '2026-05-16T14:07:35.956Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (2, 'storage-schema', 'f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd', '2026-05-16T14:07:35.958Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (3, 'pathtoken-column', '2cb1b0004b817b29d5b0a971af16bafeede4b70d', '2026-05-16T14:07:35.974Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (4, 'add-migrations-rls', '427c5b63fe1c5937495d9c635c263ee7a5905058', '2026-05-16T14:07:35.982Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (5, 'add-size-functions', '79e081a1455b63666c1294a440f8ad4b1e6a7f84', '2026-05-16T14:07:35.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (6, 'change-column-name-in-get-size', 'ded78e2f1b5d7e616117897e6443a925965b30d2', '2026-05-16T14:07:35.989Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (7, 'add-rls-to-buckets', 'e7e7f86adbc51049f341dfe8d30256c1abca17aa', '2026-05-16T14:07:35.993Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (8, 'add-public-to-buckets', 'fd670db39ed65f9d08b01db09d6202503ca2bab3', '2026-05-16T14:07:35.997Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (9, 'fix-search-function', 'af597a1b590c70519b464a4ab3be54490712796b', '2026-05-16T14:07:36.003Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (10, 'search-files-search-function', 'b595f05e92f7e91211af1bbfe9c6a13bb3391e16', '2026-05-16T14:07:36.007Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (11, 'add-trigger-to-auto-update-updated_at-column', '7425bdb14366d1739fa8a18c83100636d74dcaa2', '2026-05-16T14:07:36.011Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (12, 'add-automatic-avif-detection-flag', '8e92e1266eb29518b6a4c5313ab8f29dd0d08df9', '2026-05-16T14:07:36.015Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (13, 'add-bucket-custom-limits', 'cce962054138135cd9a8c4bcd531598684b25e7d', '2026-05-16T14:07:36.018Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (14, 'use-bytes-for-max-size', '941c41b346f9802b411f06f30e972ad4744dad27', '2026-05-16T14:07:36.022Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (15, 'add-can-insert-object-function', '934146bc38ead475f4ef4b555c524ee5d66799e5', '2026-05-16T14:07:36.044Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (16, 'add-version', '76debf38d3fd07dcfc747ca49096457d95b1221b', '2026-05-16T14:07:36.048Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (17, 'drop-owner-foreign-key', 'f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101', '2026-05-16T14:07:36.051Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (18, 'add_owner_id_column_deprecate_owner', 'e7a511b379110b08e2f214be852c35414749fe66', '2026-05-16T14:07:36.055Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (19, 'alter-default-value-objects-id', '02e5e22a78626187e00d173dc45f58fa66a4f043', '2026-05-16T14:07:36.060Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (20, 'list-objects-with-delimiter', 'cd694ae708e51ba82bf012bba00caf4f3b6393b7', '2026-05-16T14:07:36.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (21, 's3-multipart-uploads', '8c804d4a566c40cd1e4cc5b3725a664a9303657f', '2026-05-16T14:07:36.069Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (22, 's3-multipart-uploads-big-ints', '9737dc258d2397953c9953d9b86920b8be0cdb73', '2026-05-16T14:07:36.081Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (23, 'optimize-search-function', '9d7e604cddc4b56a5422dc68c9313f4a1b6f132c', '2026-05-16T14:07:36.090Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (24, 'operation-function', '8312e37c2bf9e76bbe841aa5fda889206d2bf8aa', '2026-05-16T14:07:36.094Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (25, 'custom-metadata', 'd974c6057c3db1c1f847afa0e291e6165693b990', '2026-05-16T14:07:36.098Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (26, 'objects-prefixes', '215cabcb7f78121892a5a2037a09fedf9a1ae322', '2026-05-16T14:07:36.101Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (27, 'search-v2', '859ba38092ac96eb3964d83bf53ccc0b141663a6', '2026-05-16T14:07:36.104Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (28, 'object-bucket-name-sorting', 'c73a2b5b5d4041e39705814fd3a1b95502d38ce4', '2026-05-16T14:07:36.108Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (29, 'create-prefixes', 'ad2c1207f76703d11a9f9007f821620017a66c21', '2026-05-16T14:07:36.111Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (30, 'update-object-levels', '2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6', '2026-05-16T14:07:36.114Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (31, 'objects-level-index', 'b40367c14c3440ec75f19bbce2d71e914ddd3da0', '2026-05-16T14:07:36.118Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (32, 'backward-compatible-index-on-objects', 'e0c37182b0f7aee3efd823298fb3c76f1042c0f7', '2026-05-16T14:07:36.123Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (33, 'backward-compatible-index-on-prefixes', 'b480e99ed951e0900f033ec4eb34b5bdcb4e3d49', '2026-05-16T14:07:36.126Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (34, 'optimize-search-function-v1', 'ca80a3dc7bfef894df17108785ce29a7fc8ee456', '2026-05-16T14:07:36.129Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (35, 'add-insert-trigger-prefixes', '458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc', '2026-05-16T14:07:36.133Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (36, 'optimise-existing-functions', '6ae5fca6af5c55abe95369cd4f93985d1814ca8f', '2026-05-16T14:07:36.136Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (37, 'add-bucket-name-length-trigger', '3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1', '2026-05-16T14:07:36.139Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (38, 'iceberg-catalog-flag-on-buckets', '02716b81ceec9705aed84aa1501657095b32e5c5', '2026-05-16T14:07:36.144Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (39, 'add-search-v2-sort-support', '6706c5f2928846abee18461279799ad12b279b78', '2026-05-16T14:07:36.155Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (40, 'fix-prefix-race-conditions-optimized', '7ad69982ae2d372b21f48fc4829ae9752c518f6b', '2026-05-16T14:07:36.159Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (41, 'add-object-level-update-trigger', '07fcf1a22165849b7a029deed059ffcde08d1ae0', '2026-05-16T14:07:36.163Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (42, 'rollback-prefix-triggers', '771479077764adc09e2ea2043eb627503c034cd4', '2026-05-16T14:07:36.166Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (43, 'fix-object-level', '84b35d6caca9d937478ad8a797491f38b8c2979f', '2026-05-16T14:07:36.169Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (44, 'vector-bucket-type', '99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3', '2026-05-16T14:07:36.173Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (45, 'vector-buckets', '049e27196d77a7cb76497a85afae669d8b230953', '2026-05-16T14:07:36.177Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (46, 'buckets-objects-grants', 'fedeb96d60fefd8e02ab3ded9fbde05632f84aed', '2026-05-16T14:07:36.185Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (47, 'iceberg-table-metadata', '649df56855c24d8b36dd4cc1aeb8251aa9ad42c2', '2026-05-16T14:07:36.189Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (48, 'iceberg-catalog-ids', 'e0e8b460c609b9999ccd0df9ad14294613eed939', '2026-05-16T14:07:36.192Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (49, 'buckets-objects-grants-postgres', '072b1195d0d5a2f888af6b2302a1938dd94b8b3d', '2026-05-16T14:07:36.207Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (50, 'search-v2-optimised', '6323ac4f850aa14e7387eb32102869578b5bd478', '2026-05-16T14:07:36.211Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (51, 'index-backward-compatible-search', '2ee395d433f76e38bcd3856debaf6e0e5b674011', '2026-05-16T14:07:36.997Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (52, 'drop-not-used-indexes-and-functions', '5cc44c8696749ac11dd0dc37f2a3802075f3a171', '2026-05-16T14:07:36.999Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (53, 'drop-index-lower-name', 'd0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854', '2026-05-16T14:07:37.009Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (54, 'drop-index-object-level', '6289e048b1472da17c31a7eba1ded625a6457e67', '2026-05-16T14:07:37.011Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (55, 'prevent-direct-deletes', '262a4798d5e0f2e7c8970232e03ce8be695d5819', '2026-05-16T14:07:37.013Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (56, 'fix-optimized-search-function', 'b823ed1e418101032fa01374edc9a436e54e3ed4', '2026-05-16T14:07:37.017Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (57, 's3-multipart-uploads-metadata', 'f127886e00d1b374fadbc7c6b31e09336aad5287', '2026-05-16T14:07:37.022Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (58, 'operation-ergonomics', '00ca5d483b3fe0d522133d9002ccc5df98365120', '2026-05-16T14:07:37.025Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (59, 'drop-unused-functions', '38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4', '2026-05-16T14:07:37.029Z') ON CONFLICT DO NOTHING;
INSERT INTO "storage"."migrations" ("id", "name", "hash", "executed_at") VALUES (60, 'optimize-existing-functions-again', 'db35e1c91a9201e59f4fef8d972c2f277d68b157', '2026-05-16T14:07:37.034Z') ON CONFLICT DO NOTHING;

-- Data for "public"."announcements"
INSERT INTO "public"."announcements" ("id", "title", "content", "created_at", "is_published") VALUES ('69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'SAÜ Milli Teknoloji Atölyesi''nde Bilim ve Teknoloji Haftası Programı', 'Sakarya Üniversitesi Milli Teknoloji Atölyesi''nde, 8-14 Mart Bilim ve Teknoloji Haftası kapsamında düzenlenen programda, teknoloji üretimi ve yapay zeka uygulamaları ele alındı.

8–14 Mart Bilim ve Teknoloji Haftası kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi''nde düzenlenen programda, bilimsel üretim paketleri, üniversitelerin teknoloji geliştirmedeki rolü ve sanayide yapay zeka uygulamaları çeşitli oturumlarda seçildi. Programın sunumunda Rektör Yardımcıları Prof. Dr. Mehmet Barış Horzum, Prof. Dr. Halit Yaşar ve Prof. Konuşmalarda üniversitelerin teknolojik gelişmesindeki rol ile araştırma üniversitesi kapsamı çerçevesinde yürütülen çalışmalar değerlendirildi. Ayrıca üniversite–sanayi birleşiyor, uygulamalı eğitim ve gençlerin araştırma kültürünün gelişmesinin önemi vurgulanıyor.

Milli Teknoloji Atölyesi''nin sunduğu olanaklarla anlatıldı

Açılış bölümünde ayrıca Sakarya Üniversitesi bünyesinde kurulan Milli Teknoloji Atölyesinin üniversitenin araştırma ve teknoloji geliştirme vizyonu bölgesinin yeri seçildi. Atölyenin projelerinin gelişmesiyle aktifleşmesini destekleyen bir merkez olarak önemli bir rolün üstlendiği ifade edildi.

Program kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi tanıtım sunumu gerçekleştirildi. Sunumda atölyenin kuruluş amacı, dağıtılan dağıtımlar ve dağıtım olanakları hakkında bilgi verildi. Tanıtımda atölyenin gençlerin proje geliştirme yeteneklerini artırmayı, teknoloji üretimine aktif katılımlarını sağlamayı ve disiplinler arası çalışmaları teşvik etmeyi hedeflediği belirtildi. Ayrıca atölyede yönetilen robotik, elektronik ve yazılımsal işbirliği ile uygulamalı eğitim paketlerine nasıl dahil edilebilecekleri hakkında bilgilendirme yapıldı.

Sanayide yeni trendler ve yapay zeka konuşuldu

Programın son bölümünde ise TÜBİTAK Bilim Söyleşisi adlı “Sanayide Yeni Trendler ve Yapay Zeka Uygulamaları” yer alıyor. Söyleşide yapay zekâ teknolojilerinin sanayi üretim geniş kullanım alanları ele alınırken, Endüstri 4.0 kapsamında veri analitiği, makine öğrenmesi ve otomasyon ölçümleri üretim değişimlerine katkıları değerlendirildi. Ayrıca otomasyon endüstriyelin önemli bileşenlerinden biri olan PLC sistemleri ve programlama boyutları hakkında bilgi verildi.

Söyleşide akıllı üretim sistemleri, kalite kontrol, bakım tahmin ve üretim çeşitliliği gibi alanlarda yapay zeka ve otomasyon teknolojilerinin sunduğu imkanlar da mevcutla paylaşıldı.', '2026-06-02T13:11:36.448Z', true) ON CONFLICT DO NOTHING;

-- Data for "public"."ekip"
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('f36a05b0-6402-42d0-b778-7da968720a77', 'İsmail Bütün', 'LİDER', 'Yazılım', 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T11:58:41.464Z', 4) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('b5854c91-9da8-4860-8598-6529a39b619c', 'Serhat Har', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T11:59:23.391Z', 3) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('e8251215-e599-4fb1-8651-45014d9d8fb8', 'Amro Baseet', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:12:05.545Z', 1) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('fea17365-a556-4a8e-80f9-dd797b1a0f2b', 'Moataz Armash', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:16:58.492Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('f8b12e72-af04-4e98-a562-92b366a91509', 'Gökdeniz Demir', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:11:29.971Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('a23aeb13-95a8-4589-966b-2226ea0ef78e', 'Sevcan Bayraktar', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:14:58.512Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('b292ceb7-fc4b-48e6-989f-065dec9c96f3', 'Sarah Al Musawi', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:15:59.638Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('09a797ca-e1e1-47a1-9390-1972902d58d5', 'Doğukan Ardahan', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:12:29.855Z', 2) ON CONFLICT DO NOTHING;

-- Data for "public"."ortaklar"
INSERT INTO "public"."ortaklar" ("id", "name", "icon", "url", "sort_order", "is_published", "created_at") VALUES ('523698d4-9a1f-4875-bbe0-6dc56829b779', 'TÜBİTAK', 'fa-atom', 'https://tubitak.gov.tr/', 1, true, '2026-05-16T18:00:27.359Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."ortaklar" ("id", "name", "icon", "url", "sort_order", "is_published", "created_at") VALUES ('8422d23b-dec0-46c1-b95f-496a3dd7d01b', 'SARGEM', 'fa-graduation-cap', '#', 6, true, '2026-05-16T18:00:27.359Z') ON CONFLICT DO NOTHING;

-- Data for "public"."projects"
INSERT INTO "public"."projects" ("id", "title", "description", "image_url", "github_url", "demo_url", "created_at", "is_published", "status", "funder", "date_range", "progress_pct") VALUES ('257d0641-2ae0-4ad8-9188-4ef380afb2b9', 'IoTNefes', 'Esentepe Kampüsü''nde hava kalitesini izleyen IoT (Nesnelerin İnterneti) tabanlı bir erken uyarı sistemidir. Projenin öne çıkan detayları şunlardır:Amaç: Kampüs içindeki hava kalitesini anlık olarak ölçmek, sürdürülebilirliğe katkı sağlamak ve riskli durumlarda yetkilileri uyarmak.Ölçülen Parametreler: Sıcaklık, nem, karbondioksit (CO₂) ve partikül madde değerleri.Çalışma Prensibi: Çeşitli noktalara yerleştirilen sensörler, verileri kablosuz altyapı ile merkezi bir ağa aktarır.', NULL, NULL, NULL, '2026-06-25T13:36:04.981Z', true, 'done', 'tübitak', '15/03/2025 - 15/08/2025', 100) ON CONFLICT DO NOTHING;

-- Data for "public"."site_ayarlari"
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_adres', 'Sakarya Üniversitesi, Bilgisayar ve Bilişim Bilimleri Fakültesi, Esentepe Kampüsü, 54187 Serdivan / Sakarya', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_telefon', '+90 (264) 295 XXXX', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_calisma_saatleri', 'Pazartesi – Cuma: 09:00 – 17:00', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('kurulis_yili', '2025', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_email', 'ibutun@sakarya.edu.tr', '2026-05-17T15:52:26.825Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('is_ortagi_sayisi', '2', '2026-05-17T16:15:34.055Z') ON CONFLICT DO NOTHING;

-- Data for "realtime"."schema_migrations"
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116024918', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116045059', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116050929', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116051442', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116212300', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116213355', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116213934', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211116214523', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211122062447', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211124070109', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211202204204', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211202204605', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211210212804', '2026-05-16T14:07:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20211228014915', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220107221237', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220228202821', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220312004840', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220603231003', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220603232444', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220615214548', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220712093339', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220908172859', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20220916233421', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230119133233', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230128025114', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230128025212', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230227211149', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230228184745', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230308225145', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20230328144023', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20231018144023', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20231204144023', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20231204144024', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20231204144025', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240108234812', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240109165339', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240227174441', '2026-05-16T14:07:05.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240311171622', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240321100241', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240401105812', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240418121054', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240523004032', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240618124746', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240801235015', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240805133720', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240827160934', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240919163303', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20240919163305', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241019105805', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241030150047', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241108114728', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241121104152', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241130184212', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241220035512', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241220123912', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20241224161212', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250107150512', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250110162412', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250123174212', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250128220012', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250506224012', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250523164012', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250714121412', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20250905041441', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20251103001201', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20251120212548', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20251120215549', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20260218120000', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20260326120000', '2026-05-16T14:07:08.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20260514120000', '2026-06-03T07:46:07.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20260527120000', '2026-06-03T07:46:07.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "realtime"."schema_migrations" ("version", "inserted_at") VALUES ('20260528120000', '2026-06-03T07:46:07.000Z') ON CONFLICT DO NOTHING;

SELECT setval('auth.refresh_tokens_id_seq', COALESCE((SELECT last_value FROM "auth"."refresh_tokens_id_seq"), 1), true);
