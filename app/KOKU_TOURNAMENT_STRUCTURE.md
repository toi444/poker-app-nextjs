# 石高トーナメント プロジェクト構造 完全版

## 📁 フォルダ・ファイル構成

### 現在実装済み

```
poker-app-nextjs/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                    # メインダッシュボード
│   ├── koku-tournament/
│   │   ├── page.tsx                    # 石高トーナメント ダッシュボード ✅
│   │   └── game/
│   │       └── battle/
│   │           ├── opponent/
│   │           │   └── page.tsx        # 相手選択画面（未実装）
│   │           ├── phase1/
│   │           │   └── page.tsx        # 出陣演出 ✅
│   │           ├── phase2/
│   │           │   └── page.tsx        # 敵軍の攻撃 ✅
│   │           ├── phase3/
│   │           │   └── page.tsx        # 味方の反撃 ✅
│   │           └── phase4/
│   │               └── page.tsx        # 結果発表 ✅
│   ├── all-gamble/
│   ├── all-gamble-community/
│   ├── community/
│   ├── stats/
│   ├── game-report/
│   ├── game-report-batch/
│   ├── pbank/
│   ├── profile/
│   ├── lesson/
│   ├── baccarat-lesson/
│   ├── betting-simulator/
│   └── login/
│       └── page.tsx                    # ログイン画面 ✅
├── lib/
│   ├── supabase.ts                     # Supabaseクライアント ✅
│   └── auth.ts                         # 認証ヘルパー関数 ✅
├── .env.local                          # 環境変数
└── package.json
```

### 今後実装予定

```
poker-app-nextjs/
├── app/
│   ├── koku-tournament/
│   │   ├── ranking/
│   │   │   └── page.tsx                # ランキング詳細画面 🔜
│   │   ├── history/
│   │   │   └── page.tsx                # 履歴詳細画面 🔜
│   │   ├── admin/
│   │   │   ├── page.tsx                # 管理者ダッシュボード 🔜
│   │   │   ├── players/
│   │   │   │   └── page.tsx            # プレイヤー管理 🔜
│   │   │   ├── tournament/
│   │   │   │   └── page.tsx            # トーナメント管理 🔜
│   │   │   ├── logs/
│   │   │   │   └── page.tsx            # ログ閲覧 🔜
│   │   │   └── settings/
│   │   │       └── page.tsx            # システム設定 🔜
│   │   └── game/
│   │       ├── battle/
│   │       │   └── opponent/
│   │       │       └── page.tsx        # 相手選択画面 🔜
│   │       ├── siege/                  # 弐之陣「城攻め」 🔜
│   │       │   ├── opponent/
│   │       │   ├── phase1/
│   │       │   ├── phase2/
│   │       │   ├── phase3/
│   │       │   └── phase4/
│   │       └── duel/                   # 参之陣「一騎討ち」 🔜
│   │           ├── opponent/
│   │           ├── phase1/
│   │           ├── phase2/
│   │           ├── phase3/
│   │           └── phase4/
│   └── api/
│       └── koku-tournament/            # APIルート 🔜
│           ├── init-player/
│           ├── record-battle/
│           ├── get-ranking/
│           └── get-history/
├── lib/
│   ├── koku-tournament/
│   │   ├── game-logic.ts               # ゲームロジック関数 🔜
│   │   ├── ranking.ts                  # ランキング計算 🔜
│   │   └── admin.ts                    # 管理者機能 🔜
│   └── utils/
│       ├── date.ts                     # 日時ユーティリティ（JST） 🔜
│       └── constants.ts                # 定数定義 🔜
└── types/
    └── koku-tournament.ts              # 型定義 🔜
```

---

## 🗄️ データベース構造（Supabase）

### 1. 石高トーナメント関連テーブル

#### `monthly_tournaments` - 月間トーナメント
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| month | DATE | 月初日（例: 2025-02-01） |
| status | TEXT | 'active' or 'ended' |
| total_pot | INTEGER | 宝物庫の総額（P） |
| total_games | INTEGER | 総ゲーム数 |
| prize_1st | INTEGER | 1位の賞金 |
| prize_2nd | INTEGER | 2位の賞金 |
| prize_3rd | INTEGER | 3位の賞金 |
| started_at | TIMESTAMPTZ | 開始日時 |
| ended_at | TIMESTAMPTZ | 終了日時 |
| created_at | TIMESTAMPTZ | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (month)

**RLS:**
- SELECT: 全員閲覧可能

---

#### `player_monthly_stats` - プレイヤー月間統計
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| tournament_id | UUID | FK: monthly_tournaments |
| user_id | UUID | ユーザーID（profiles参照） |
| player_name | TEXT | プレイヤー名 |
| starting_koku | INTEGER | 初期万石（100） |
| current_koku | INTEGER | 現在の万石 |
| total_matches | INTEGER | 総対戦数 |
| total_attacks | INTEGER | 攻撃回数 |
| total_defenses | INTEGER | 防御回数 |
| total_wins | INTEGER | 勝利数 |
| total_losses | INTEGER | 敗北数 |
| total_p_spent | INTEGER | 消費P |
| final_rank | INTEGER | 最終順位 |
| reward_p | INTEGER | 獲得賞金 |
| rank_timestamp | TIMESTAMPTZ | 現在の万石到達時刻 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (tournament_id, user_id)
- INDEX (tournament_id)
- INDEX (user_id)
- INDEX (current_koku DESC) ← ランキング用

**RLS:**
- SELECT: 全員閲覧可能
- UPDATE: 自分のデータのみ更新可能

**トリガー:**
- `update_rank_timestamp`: current_koku変更時にrank_timestampを更新

---

#### `daily_attack_limits` - 日次攻撃制限
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| tournament_id | UUID | FK: monthly_tournaments |
| user_id | UUID | ユーザーID |
| date | DATE | JST基準の日付 |
| attack_count | INTEGER | その日の攻撃回数 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE (tournament_id, user_id, date)
- INDEX (user_id, date)

**RLS:**
- SELECT: 自分のデータのみ閲覧可能
- INSERT: 自分のデータのみ作成可能
- UPDATE: 自分のデータのみ更新可能

---

#### `battle_matches` - 壱之陣（合戦）対戦記録
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| tournament_id | UUID | FK: monthly_tournaments |
| challenger_id | UUID | 攻め手のユーザーID |
| defender_id | UUID | 守り手のユーザーID |
| challenger_name | TEXT | 攻め手の名前 |
| defender_name | TEXT | 守り手の名前 |
| enemy_roll | INTEGER | 敵軍の数値（1-100） |
| enemy_type | TEXT | 'ashigaru', 'cavalry', 'gunner' |
| ally_roll | INTEGER | 味方の数値（1-100 or 999） |
| ally_type | TEXT | 'ashigaru', 'cavalry', 'gunner', 'tank' |
| is_tank | BOOLEAN | 戦車隊が出たか |
| result | TEXT | 'win' or 'lose' |
| koku_change | INTEGER | +1 or -1 |
| p_spent | INTEGER | 消費P（50） |
| created_at | TIMESTAMPTZ | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (tournament_id)
- INDEX (challenger_id)
- INDEX (defender_id)
- INDEX (created_at DESC) ← 履歴表示用

**RLS:**
- SELECT: 全員閲覧可能
- INSERT: 攻め手のみ作成可能

---

#### `match_history` - 対戦履歴（統合）
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| tournament_id | UUID | FK: monthly_tournaments |
| player_id | UUID | 記録対象プレイヤー（攻め手） |
| player_name | TEXT | プレイヤー名 |
| game_type | TEXT | 'battle', 'siege', 'duel' |
| match_id | UUID | 各ゲームテーブルのID |
| opponent_id | UUID | 相手のID（非表示だが記録） |
| result | TEXT | 'win' or 'lose' |
| koku_change | INTEGER | 石高変動 |
| p_spent | INTEGER | 消費P |
| created_at | TIMESTAMPTZ | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (player_id)
- INDEX (tournament_id)
- INDEX (created_at DESC)

**RLS:**
- SELECT: 全員閲覧可能
- INSERT: 自分のデータのみ作成可能

---

### 2. 管理者関連テーブル

#### `admin_roles` - 管理者ロール
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（UNIQUE） |
| role | TEXT | 'super_admin' or 'admin' |
| created_at | TIMESTAMPTZ | 作成日時 |

**RLS:**
- SELECT: 管理者のみ閲覧可能

---

#### `admin_logs` - 管理者操作ログ
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| admin_id | UUID | 管理者のユーザーID |
| admin_name | TEXT | 管理者名 |
| action | TEXT | 操作内容 |
| target_user_id | UUID | 対象ユーザーID |
| target_user_name | TEXT | 対象ユーザー名 |
| details | JSONB | 詳細情報 |
| created_at | TIMESTAMPTZ | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX (admin_id)
- INDEX (created_at DESC)
- INDEX (target_user_id)

**RLS:**
- SELECT: 管理者のみ閲覧可能

---

#### `system_settings` - システム設定
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| key | TEXT | 設定キー（UNIQUE） |
| value | JSONB | 設定値 |
| description | TEXT | 説明 |
| updated_by | UUID | 更新者 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**初期データ:**
```json
{
  "max_attacks_per_day": "20",
  "game_cost_p": "50",
  "prize_distribution": {"1st": 50, "2nd": 35, "3rd": 15},
  "starting_koku": "100"
}
```

**RLS:**
- SELECT: 管理者のみ閲覧可能

---

### 3. 既存テーブル（参考）

#### `profiles` - ユーザープロフィール
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー（auth.users参照） |
| username | TEXT | ユーザー名 |
| avatar_url | TEXT | アバターURL |
| role | TEXT | 'player' or 'admin' |
| active | BOOLEAN | アクティブ状態 |
| created_at | TIMESTAMPTZ | 作成日時 |

---

## 🔧 Supabase関数（Functions）

### 日時・ユーティリティ関数

#### `get_jst_date()` - 現在のJST日付取得
```sql
RETURNS DATE
```
現在時刻をAsia/Tokyoタイムゾーンで取得し、DATE型で返す

#### `get_active_tournament()` - アクティブトーナメント取得
```sql
RETURNS UUID
```
現在アクティブなトーナメントのIDを返す

---

### プレイヤー管理関数

#### `initialize_player_for_tournament(p_user_id, p_username)`
```sql
RETURNS JSONB
```
新規プレイヤーをトーナメントに参加させる
- 既存チェック
- player_monthly_statsに初期データ挿入
- 初期万石: 100

#### `get_player_tournament_data(p_user_id)`
```sql
RETURNS JSONB
```
プレイヤーの現在のトーナメントデータを取得
- 石高、順位、戦績、今日の攻撃回数など
- ランキング計算を含む

---

### 攻撃制限関数

#### `increment_daily_attacks(p_tournament_id, p_user_id)`
```sql
RETURNS BOOLEAN
```
今日の攻撃回数を1増やす
- 20回上限チェック
- 日付はJST基準

#### `can_attack_today(p_tournament_id, p_user_id)`
```sql
RETURNS BOOLEAN
```
今日まだ攻撃可能かチェック
- 20回未満ならTRUE

---

### 管理者チェック関数

#### `is_admin(check_user_id)`
```sql
RETURNS BOOLEAN
```
指定ユーザーが管理者かチェック

#### `is_super_admin(check_user_id)`
```sql
RETURNS BOOLEAN
```
指定ユーザーがスーパー管理者かチェック

---

## 📊 データフロー

### 壱之陣（合戦）のデータフロー

```
1. ユーザーがゲーム開始
   ↓
2. can_attack_today() でチェック
   ↓
3. Phase 1: 出陣演出（パラメータ渡し）
   ↓
4. Phase 2: 敵軍の攻撃
   - ランダムで敵の兵種決定
   - ランダムで数値決定
   - パラメータでPhase 3へ
   ↓
5. Phase 3: 味方の反撃
   - 15%で戦車隊判定
   - 戦車隊なら999、通常ならランダム
   - 勝敗判定: finalValue > enemyValue
   - パラメータでPhase 4へ
   ↓
6. Phase 4: 結果発表
   - 結果表示
   - 【ここでSupabaseに記録】
   ↓
7. バックエンド処理（API Route）
   - increment_daily_attacks()
   - battle_matchesに挿入
   - match_historyに挿入
   - player_monthly_statsを更新
     - current_koku ± 1
     - total_wins or total_losses + 1
     - total_matches + 1
     - total_p_spent + 50
   - monthly_tournamentsを更新
     - total_pot + 50
     - total_games + 1
```

---

## 🎯 実装優先順位

### Phase 1: 壱之陣のデータベース連携（優先度: 高）
- [x] データベーススキーマ作成
- [x] プレイヤー初期化関数
- [ ] ゲーム記録API作成
- [ ] Phase 4からのデータ送信
- [ ] ダッシュボードのデータ取得

### Phase 2: ランキング・履歴機能（優先度: 高）
- [ ] ランキング詳細画面
- [ ] 履歴詳細画面
- [ ] リアルタイム更新

### Phase 3: 相手選択機能（優先度: 高）
- [ ] プレイヤー一覧取得
- [ ] 相手選択UI
- [ ] Phase 1へのパラメータ渡し

### Phase 4: 管理者画面（優先度: 中）
- [ ] ダッシュボード
- [ ] プレイヤー管理
- [ ] トーナメント管理
- [ ] ログ閲覧

### Phase 5: 弐之陣・参之陣（優先度: 低）
- [ ] 城攻めゲームロジック
- [ ] 一騎討ちゲームロジック
- [ ] 各Phase実装

---

## 🔐 環境変数

### `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📝 重要な設計ポイント

### 1. タイムゾーン管理
- **すべてAsia/Tokyo（JST）基準**
- `get_jst_date()` 関数を使用
- データベースはUTCで保存、表示時にJST変換

### 2. ランキング計算
- `current_koku` の降順
- 同値の場合は `rank_timestamp` の昇順（先に到達した方が上位）

### 3. 石高と万石の関係
```
石高 = 数値（お金に相当）
万石 = 単位（円に相当）

正: 「あなたの石高は 100万石 です」
誤: 「あなたの万石は 100万石 です」
```

### 4. 攻撃回数制限
- 1日20回まで（JST基準の日付）
- 防御は無制限
- 攻め手のみ50P消費

### 5. RLSポリシー
- ランキング・履歴: 全員閲覧可能（相手名は非表示）
- 攻撃制限: 自分のデータのみ
- 管理者機能: 管理者のみ

---

## 🚀 デプロイ準備

### チェックリスト
- [ ] Supabaseテーブル作成完了
- [ ] Supabase関数作成完了
- [ ] 環境変数設定完了
- [ ] 認証フロー確認
- [ ] 壱之陣のデータフロー確認
- [ ] エラーハンドリング実装
- [ ] 管理者ロール設定
- [ ] 初期トーナメント作成

---

## 📚 参考資料

### Supabase公式ドキュメント
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

### Next.js公式ドキュメント
- [App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**最終更新日**: 2025年10月14日  
**バージョン**: 1.0  
**作成者**: Claude (Anthropic)