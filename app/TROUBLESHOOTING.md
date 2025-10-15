# トラブルシューティングガイド

石高トーナメント開発で遭遇する可能性のあるエラーと解決方法をまとめています。

---

## 🔴 Supabase関連エラー

### エラー1: RLSポリシーでデータが取得できない

**症状:**
```
Error: new row violates row-level security policy
```

**原因:**
Row Level Security (RLS) ポリシーが正しく設定されていない

**解決方法:**
```sql
-- 該当テーブルのポリシーを確認
SELECT * FROM pg_policies WHERE tablename = 'player_monthly_stats';

-- ポリシーを削除して再作成
DROP POLICY "policy_name" ON table_name;

-- 全員閲覧可能にする場合
CREATE POLICY "Anyone can view" ON table_name 
FOR SELECT USING (true);
```

---

### エラー2: 外部キー制約違反

**症状:**
```
Error: insert or update on table violates foreign key constraint
```

**原因:**
存在しないtournament_idやuser_idを参照しようとしている

**解決方法:**
```sql
-- 参照先のデータが存在するか確認
SELECT id FROM monthly_tournaments WHERE status = 'active';
SELECT id FROM profiles WHERE id = 'user_id_here';

-- データがない場合は先に作成
INSERT INTO monthly_tournaments (month, status) 
VALUES ('2025-02-01', 'active');
```

---

### エラー3: タイムゾーン関連の問題

**症状:**
- 日付が1日ずれる
- 攻撃回数が正しくリセットされない

**原因:**
UTCとJSTの変換が正しくない

**解決方法:**
```sql
-- get_jst_date()関数が正しく作成されているか確認
SELECT get_jst_date();

-- 現在時刻をJSTで確認
SELECT NOW() AT TIME ZONE 'Asia/Tokyo';

-- daily_attack_limitsのdateカラムを確認
SELECT date, attack_count FROM daily_attack_limits 
WHERE user_id = 'your_user_id' 
ORDER BY date DESC;
```

**フロントエンドでの対応:**
```typescript
// 日付をJSTで扱う
const jstDate = new Date().toLocaleString('ja-JP', { 
  timeZone: 'Asia/Tokyo' 
});
```

---

### エラー4: 攻撃回数が20回を超えてしまう

**症状:**
20回制限を超えて攻撃できてしまう

**原因:**
`can_attack_today()` のチェックが正しく動作していない

**解決方法:**
```sql
-- 関数を再作成
DROP FUNCTION IF EXISTS can_attack_today(UUID, UUID);

-- 正しい関数定義を実行（KOKU_TOURNAMENT_STRUCTURE.mdを参照）
CREATE OR REPLACE FUNCTION can_attack_today(...) ...

-- テスト
SELECT can_attack_today(
  (SELECT id FROM monthly_tournaments WHERE status = 'active'),
  'your_user_id'
);
```

---

### エラー5: ランキングが正しく計算されない

**症状:**
同じ石高なのに順位が間違っている

**原因:**
`rank_timestamp` トリガーが動作していない

**解決方法:**
```sql
-- トリガーが存在するか確認
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_update_rank_timestamp';

-- トリガーを再作成
DROP TRIGGER IF EXISTS trigger_update_rank_timestamp 
ON player_monthly_stats;

CREATE TRIGGER trigger_update_rank_timestamp
BEFORE UPDATE ON player_monthly_stats
FOR EACH ROW
EXECUTE FUNCTION update_rank_timestamp();

-- 手動で rank_timestamp を更新
UPDATE player_monthly_stats 
SET rank_timestamp = NOW() 
WHERE current_koku = 123;
```

---

## 🟡 Next.js / TypeScript関連エラー

### エラー6: useSearchParamsでエラーが出る

**症状:**
```
Error: useSearchParams() should be wrapped in a suspense boundary
```

**解決方法:**
```typescript
// page.tsxの先頭に追加
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// コンポーネントをSuspenseでラップ
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BattlePhase3 />
    </Suspense>
  )
}
```

---

### エラー7: 環境変数が読み込めない

**症状:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**解決方法:**
```bash
# .env.localファイルを確認
cat .env.local

# ファイルが存在しない場合は作成
touch .env.local

# 環境変数を追加
echo "NEXT_PUBLIC_SUPABASE_URL=your_url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" >> .env.local

# 開発サーバーを再起動
npm run dev
```

---

### エラー8: Supabaseクライアントの初期化エラー

**症状:**
```
Error: supabase is not defined
```

**解決方法:**
```typescript
// lib/supabase.ts が正しく作成されているか確認
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### エラー9: TypeScriptの型エラー

**症状:**
```
Type 'string | null' is not assignable to type 'string'
```

**解決方法:**
```typescript
// オプショナルチェーンとデフォルト値を使用
const opponentName = searchParams.get('opponent') || 'プレイヤーA'

// または型アサーション
const enemyValue = parseInt(searchParams.get('enemyValue') ?? '0')

// nullチェック
const value = searchParams.get('value')
if (value === null) {
  console.error('Value is missing')
  return
}
```

---

## 🟢 ゲームロジック関連エラー

### エラー10: 勝敗判定が逆になる

**症状:**
Phase 3で勝っているのにPhase 4で負けと表示される

**原因:**
`isWin` の判定式が間違っている

**解決方法:**
```typescript
// ❌ 間違い
const isWin = enemyValue > allyValue

// ✅ 正しい
const isWin = allyValue > enemyValue
```

---

### エラー11: 戦車隊の999が表示されない

**症状:**
戦車隊が出ても999と表示されない

**原因:**
`finalValue` が正しく設定されていない

**解決方法:**
```typescript
// 味方の兵種と最終値を分けてstate管理
const [isTankMode] = useState(() => Math.random() < 0.15)

const [allyUnit] = useState<UnitType>(() => {
  if (isTankMode) {
    return TANK_UNIT
  } else {
    return ALLY_UNIT_TYPES[Math.floor(Math.random() * ALLY_UNIT_TYPES.length)]
  }
})

const [finalValue] = useState(() => {
  if (isTankMode) {
    return 999  // ← ここ重要！
  } else {
    return Math.floor(Math.random() * (allyUnit.max - allyUnit.min + 1)) + allyUnit.min
  }
})
```

---

### エラー12: URLパラメータが引き継がれない

**症状:**
Phase 3で Phase 2のデータが取得できない

**解決方法:**
```typescript
// Phase 2でパラメータを渡す
href={`/koku-tournament/game/battle/phase3?opponent=${encodeURIComponent(opponentName)}&enemyValue=${finalValue}&enemyUnit=${enemyUnit.id}`}

// Phase 3で受け取る
const searchParams = useSearchParams()
const enemyValue = parseInt(searchParams.get('enemyValue') || '67')
const enemyUnitId = searchParams.get('enemyUnit') || 'cavalry'

// デバッグ用にconsole.logで確認
console.log('Received params:', {
  enemyValue,
  enemyUnitId
})
```

---

## 🔵 デプロイ関連エラー

### エラー13: Vercelデプロイでビルドエラー

**症状:**
```
Error: Failed to compile
```

**解決方法:**
```bash
# ローカルでビルドテスト
npm run build

# エラー箇所を修正してから再デプロイ
git add .
git commit -m "Fix build error"
git push
```

---

### エラー14: 環境変数がVercelに設定されていない

**症状:**
デプロイ後にSupabaseに接続できない

**解決方法:**
1. Vercelダッシュボードを開く
2. Project → Settings → Environment Variables
3. 以下を追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 再デプロイ

---

## 🟣 パフォーマンス関連

### エラー15: ページの読み込みが遅い

**症状:**
ダッシュボードの表示に5秒以上かかる

**原因:**
- 不要なデータを取得している
- インデックスが設定されていない

**解決方法:**
```sql
-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_battle_matches_created 
ON battle_matches(created_at DESC);

-- クエリを最適化（必要なカラムのみ取得）
SELECT id, challenger_name, result, koku_change, created_at
FROM battle_matches
WHERE tournament_id = 'xxx'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🛠️ デバッグのコツ

### 1. ブラウザの開発者ツールを活用

```javascript
// Console でエラーを確認
console.error('Error:', error)

// Network タブで通信を確認
// - Status Code: 200 (成功), 400 (クライアントエラー), 500 (サーバーエラー)
```

### 2. Supabaseのログを確認

1. Supabase Dashboard → Logs
2. API Logs でエラーを確認
3. Database Logs でSQLエラーを確認

### 3. console.logで中間状態を確認

```typescript
// 各Phaseで確実に値を確認
console.log('Phase 2 - Enemy Unit:', enemyUnit)
console.log('Phase 2 - Final Value:', finalValue)

console.log('Phase 3 - Received enemyValue:', enemyValue)
console.log('Phase 3 - Is Tank Mode:', isTankMode)
console.log('Phase 3 - Ally Final Value:', finalValue)
console.log('Phase 3 - Is Win:', isWin)

console.log('Phase 4 - Received params:', { isWin, allyValue, enemyValue })
```

---

## 📞 サポート

それでも解決しない場合は、以下の情報を添えて質問してください：

1. エラーメッセージ（全文）
2. どの画面・機能で発生したか
3. 再現手順
4. console.log の出力
5. 環境（ローカル/デプロイ済み）

---

**最終更新日**: 2025年10月14日  
**バージョン**: 1.0