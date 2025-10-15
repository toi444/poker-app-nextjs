# API仕様書 - 石高トーナメント

## 📚 概要

石高トーナメントのバックエンドAPI仕様をまとめています。

### ベースURL
- **開発環境**: `http://localhost:3000/api/koku-tournament`
- **本番環境**: `https://your-domain.com/api/koku-tournament`

### 認証
すべてのAPIはSupabase Authによる認証が必要です。

```typescript
// リクエストヘッダー
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

---

## 🎮 ゲーム関連API

### 1. プレイヤー初期化

新規プレイヤーをトーナメントに参加させる

**エンドポイント:** `POST /koku-tournament/init-player`

**リクエストボディ:**
```json
{
  "userId": "uuid",
  "username": "プレイヤー名"
}
```

**レスポンス（成功）:**
```json
{
  "success": true,
  "message": "トーナメントに参加しました！",
  "stats": {
    "tournament_id": "uuid",
    "user_id": "uuid",
    "player_name": "プレイヤー名",
    "current_koku": 100,
    "total_matches": 0,
    "total_wins": 0,
    "total_losses": 0
  }
}
```

**レスポンス（既に参加済み）:**
```json
{
  "success": true,
  "message": "既に参加済みです",
  "stats": { ... }
}
```

**エラー:**
```json
{
  "success": false,
  "error": "アクティブなトーナメントがありません"
}
```

---

### 2. プレイヤーデータ取得

現在のトーナメントデータを取得

**エンドポイント:** `GET /koku-tournament/player-data`

**クエリパラメータ:**
- `userId`: ユーザーID（UUID）

**レスポンス:**
```json
{
  "username": "プレイヤー名",
  "koku": 123,
  "rank": 3,
  "totalPlayers": 8,
  "attacksToday": 8,
  "maxAttacks": 20,
  "wins": 45,
  "losses": 32,
  "totalMatches": 77,
  "pSpent": 3850
}
```

---

### 3. 壱之陣（合戦）記録

対戦結果をデータベースに記録

**エンドポイント:** `POST /koku-tournament/record-battle`

**リクエストボディ:**
```json
{
  "tournamentId": "uuid",
  "challengerId": "uuid",
  "defenderId": "uuid",
  "challengerName": "攻め手の名前",
  "defenderName": "守り手の名前",
  "enemyRoll": 67,
  "enemyType": "cavalry",
  "allyRoll": 85,
  "allyType": "gunner",
  "isTank": false,
  "result": "win",
  "kokuChange": 1
}
```

**レスポンス（成功）:**
```json
{
  "success": true,
  "message": "対戦結果を記録しました",
  "data": {
    "matchId": "uuid",
    "newKoku": 124,
    "newRank": 3,
    "newAttackCount": 9,
    "treasurePot": 36050
  }
}
```

**レスポンス（攻撃回数超過）:**
```json
{
  "success": false,
  "error": "本日の攻撃回数を使い切りました"
}
```

**処理内容:**
1. `can_attack_today()` で攻撃可能かチェック
2. `increment_daily_attacks()` で攻撃回数を増やす
3. `battle_matches` に記録挿入
4. `match_history` に記録挿入
5. `player_monthly_stats` を更新（攻め手・守り手両方）
   - `current_koku` ± 1
   - `total_wins` or `total_losses` + 1
   - `total_matches` + 1
   - `total_p_spent` + 50（攻め手のみ）
6. `monthly_tournaments` を更新
   - `total_pot` + 50
   - `total_games` + 1

---

## 📊 ランキング・統計API

### 4. ランキング取得

**エンドポイント:** `GET /koku-tournament/ranking`

**クエリパラメータ:**
- `limit`: 取得件数（デフォルト: 10）
- `offset`: オフセット（デフォルト: 0）

**レスポンス:**
```json
{
  "ranking": [
    {
      "rank": 1,
      "username": "プレイヤーA",
      "koku": 145,
      "wins": 50,
      "losses": 25,
      "totalMatches": 75,
      "trend": "up"
    }
  ],
  "totalPlayers": 8
}
```

**ソート順:**
1. `current_koku` DESC（降順）
2. `rank_timestamp` ASC（昇順、同値の場合先着優先）

---

### 5. 対戦履歴取得

**エンドポイント:** `GET /koku-tournament/history`

**クエリパラメータ:**
- `limit`: 取得件数（デフォルト: 10）
- `gameType`: ゲーム種別（'battle', 'siege', 'duel'、省略可）

**レスポンス:**
```json
{
  "history": [
    {
      "id": "uuid",
      "playerName": "プレイヤーA",
      "gameType": "battle",
      "result": "win",
      "kokuChange": 1,
      "createdAt": "2025-02-14T15:30:00+09:00",
      "timeAgo": "2分前"
    }
  ]
}
```

**注意:** 
- 相手プレイヤー名は非表示
- `opponent_id` はデータベースには記録されているが、APIレスポンスには含めない

---

### 6. 宝物庫（賞金総額）取得

**エンドポイント:** `GET /koku-tournament/treasure-pot`

**レスポンス:**
```json
{
  "totalPot": 36000,
  "totalGames": 720,
  "prizes": {
    "first": 18000,
    "second": 12600,
    "third": 5400
  },
  "distribution": {
    "first": 50,
    "second": 35,
    "third": 15
  }
}
```

---

## 👥 プレイヤー管理API

### 7. 相手候補取得

**エンドポイント:** `GET /koku-tournament/opponents`

**クエリパラメータ:**
- `userId`: 自分のユーザーID（除外用）

**レスポンス:**
```json
{
  "opponents": [
    {
      "id": "uuid",
      "username": "プレイヤーA",
      "koku": 145,
      "rank": 1,
      "wins": 50,
      "losses": 25,
      "avatarUrl": "https://..."
    }
  ]
}
```

---

### 8. プレイヤー詳細取得

**エンドポイント:** `GET /koku-tournament/player/:userId`

**レスポンス:**
```json
{
  "username": "プレイヤーA",
  "koku": 145,
  "rank": 1,
  "totalMatches": 75,
  "wins": 50,
  "losses": 25,
  "winRate": 66.7,
  "pSpent": 3750,
  "recentMatches": [
    {
      "gameType": "battle",
      "result": "win",
      "kokuChange": 1,
      "createdAt": "2025-02-14T15:30:00+09:00"
    }
  ]
}
```

---

## 🛡️ 管理者API

### 9. システム統計取得

**エンドポイント:** `GET /koku-tournament/admin/stats`

**権限:** 管理者のみ

**レスポンス:**
```json
{
  "totalPlayers": 8,
  "totalGames": 720,
  "totalPot": 36000,
  "activeToday": 6,
  "gamesByType": {
    "battle": 720,
    "siege": 0,
    "duel": 0
  }
}
```

---

### 10. プレイヤー一覧取得（管理者用）

**エンドポイント:** `GET /koku-tournament/admin/players`

**権限:** 管理者のみ

**レスポンス:**
```json
{
  "players": [
    {
      "id": "uuid",
      "username": "プレイヤーA",
      "email": "player@example.com",
      "koku": 145,
      "rank": 1,
      "totalMatches": 75,
      "pSpent": 3750,
      "lastActive": "2025-02-14T15:30:00+09:00",
      "suspicious": false
    }
  ]
}
```

---

### 11. 手動石高修正

**エンドポイント:** `POST /koku-tournament/admin/adjust-koku`

**権限:** スーパー管理者のみ

**リクエストボディ:**
```json
{
  "userId": "uuid",
  "newKoku": 150,
  "reason": "バグ修正のため"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "石高を修正しました"
}
```

---

### 12. トーナメント強制終了

**エンドポイント:** `POST /koku-tournament/admin/end-tournament`

**権限:** スーパー管理者のみ

**リクエストボディ:**
```json
{
  "tournamentId": "uuid",
  "reason": "緊急メンテナンスのため"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "トーナメントを終了しました",
  "prizesDistributed": {
    "first": { "userId": "uuid", "prize": 18000 },
    "second": { "userId": "uuid", "prize": 12600 },
    "third": { "userId": "uuid", "prize": 5400 }
  }
}
```

---

### 13. 操作ログ取得

**エンドポイント:** `GET /koku-tournament/admin/logs`

**権限:** 管理者のみ

**クエリパラメータ:**
- `limit`: 取得件数（デフォルト: 50）
- `action`: アクション種別でフィルタ（省略可）

**レスポンス:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "adminName": "管理者A",
      "action": "manual_koku_update",
      "targetUserName": "プレイヤーB",
      "details": {
        "oldKoku": 123,
        "newKoku": 150,
        "reason": "バグ修正のため"
      },
      "createdAt": "2025-02-14T15:30:00+09:00"
    }
  ]
}
```

---

## 🔍 エラーレスポンス

### 標準エラーフォーマット

```json
{
  "success": false,
  "error": "エラーメッセージ",
  "code": "ERROR_CODE"
}
```

### エラーコード一覧

| コード | 説明 | HTTPステータス |
|--------|------|---------------|
| `AUTH_REQUIRED` | 認証が必要です | 401 |
| `FORBIDDEN` | 権限がありません | 403 |
| `NOT_FOUND` | リソースが見つかりません | 404 |
| `ATTACK_LIMIT_EXCEEDED` | 攻撃回数超過 | 429 |
| `INVALID_PARAMS` | パラメータが不正です | 400 |
| `TOURNAMENT_NOT_ACTIVE` | トーナメントが開催されていません | 400 |
| `DATABASE_ERROR` | データベースエラー | 500 |

---

## 📝 実装例

### フロントエンドからのAPI呼び出し

```typescript
// プレイヤーデータ取得
const getPlayerData = async (userId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `/koku-tournament/player-data?userId=${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    }
  )
  
  return await response.json()
}

// 対戦結果記録
const recordBattle = async (battleData: BattleData) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch('/koku-tournament/record-battle', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(battleData)
  })
  
  return await response.json()
}
```

---

## 🧪 テスト用カールコマンド

```bash
# プレイヤーデータ取得
curl -X GET "http://localhost:3000/koku-tournament/player-data?userId=xxx" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 対戦結果記録
curl -X POST "http://localhost:3000/koku-tournament/record-battle" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentId": "xxx",
    "challengerId": "xxx",
    "defenderId": "yyy",
    "enemyRoll": 67,
    "enemyType": "cavalry",
    "allyRoll": 85,
    "allyType": "gunner",
    "isTank": false,
    "result": "win",
    "kokuChange": 1
  }'
```

---

**最終更新日**: 2025年10月14日  
**バージョン**: 1.0