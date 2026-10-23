# pi-antigravity

[![license](https://img.shields.io/github/license/akasakariko/pi--antigravity)](LICENSE)
[![Google Gemini 3.8 Flash](https://img.shields.io/badge/Gemini_3.8_Flash-Supported-blue?logo=google)](https://github.com/akasakariko/pi--antigravity)

**pi-antigravity** は、[Pi Coding Agent](https://pi.dev) から Google Antigravity / Cloud Code Assist のモデル群を直接利用できるようにする拡張機能（プロバイダー）です。

最新の **Google Gemini 3.8 Flash** をはじめ、Gemini 3.7 / 3.6 / 3.5 Flash、Gemini 3.1 Pro、さらに Antigravity 経由で提供される Claude や GPT-OSS モデルにも対応しています。外部 CLI プロセスを介さず、OAuth 2.0 PKCE 認証、ネイティブ SSE ストリーミング、思考力度の段階ルーティング、クォータ診断をすべて内部で完結して処理します。

> **非公式統合:** 本プロジェクトは Google による公式プロジェクトや推奨サービスではありません。アクセス権限を持つアカウントでのみ利用し、OAuth 権限を承認する前にソースコードをご確認ください。

---

## 主な特徴

- **最新の Gemini 3.8 Flash 対応**: Low、Medium、High（動的思考）の各思考モードをサポート。
- **超低レイテンシ (Fast TTFT)**: Keep-Alive 接続プールの再利用と TLS プリウォーミングにより、初回および継続ターンの応答速度を最大化。
- **安全な OAuth 2.0 認証**: PKCE 対応認可フローを採用。トークンはローカル（`~/.pi/agent/auth.json`）でのみ安全に保管・自動更新されます。
- **マルチモデル対応**: Gemini 各世代に加え、Cloud Code Assist カタログ上の Claude 4.6 (Sonnet/Opus) や GPT-OSS も単一プロバイダー経由で利用可能。
- **クォータ診断機能**: `/antigravity.usage` や `/antigravity.doctor` で共有利用枠の残りや直近のリクエスト状態を即座に確認可能。
- **画像生成サポート**: `/antigravity.image` コマンドおよびエージェント向け画像生成ツール内蔵。

---

## 目次

- [動作要件](#動作要件)
- [インストール方法](#インストール方法)
- [クイックスタート](#クイックスタート)
- [サポートモデル一覧](#サポートモデル一覧)
- [コマンドリファレンス](#コマンドリファレンス)
- [認証とセキュリティ](#認証とセキュリティ)
- [環境設定](#環境設定)
- [トラブルシューティング](#トラブルシューティング)
- [開発・コントリビューション](#開発コントリビューション)
- [友情リンク](#友情リンク)
- [ライセンス](#ライセンス)

---

## 動作要件

- **Pi Coding Agent / Pi AI**: バージョン `0.80.0` 以降
- **Google アカウント**: Cloud Code Assist / Antigravity を利用可能なアカウント
- **ブラウザ環境**: 初回 Google サインイン用（リモート/ヘッドレス環境対応あり）

---

## インストール方法

> **注意:** 本リポジトリは npm パッケージ（`npm:pi-antigravity`）からのインストールには対応しておりません。必ず以下の Git またはローカルパスによるインストールをご利用ください。

### 1. GitHub リポジトリから直接インストール (推奨)

Pi の組み込みインストーラーを使用します：

```bash
pi install git:github.com/akasakariko/pi--antigravity
```

_(または HTTPS URL を直接指定)_:

```bash
pi install https://github.com/akasakariko/pi--antigravity
```

### 2. ローカルディレクトリからインストール (開発・自己修正用)

リポジトリを手元にクローンしてインストールする場合：

```bash
git clone https://github.com/akasakariko/pi--antigravity.git
cd pi--antigravity
pi install .
```

### パッケージの更新方法

機能追加やバグ修正を取り込むには以下を実行します：

```bash
pi update git:github.com/akasakariko/pi--antigravity
```

インストールまたは更新後は、Pi 内で `/reload` を実行するか、Pi を再起動してください。

---

## クイックスタート

1. **Google アカウントでサインイン**:
   Pi を起動し、以下を実行します：

   ```text
   /login antigravity
   ```

   ブラウザが開き、Google の認証画面が表示されるので承認します。

2. **モデルの選択**:
   最新の Gemini 3.8 Flash を選択します：

   ```text
   /model antigravity/gemini-3.8-flash
   ```

3. **利用開始**:
   そのままプロンプトを入力して会話を開始できます。思考レベル（Thinking Effort）は Pi の UI から Low / Medium / High を切り替えられます。

---

## サポートモデル一覧

本拡張機能は、Antigravity バックエンドカタログ（`agy models`）に対応する以下のモデル ID を提供しています：

| 公開モデル ID       | 入力           | 対応思考レベル    | 最大出力トークン | 実際のルーティング先                                                                                    |
| ------------------- | -------------- | ----------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| `gemini-4-argon`    | テキスト、画像 | Low, Medium, High | 65,536           | low → `gemini-4-argon-low`<br>medium → `gemini-4-argon-medium`<br>high → `gemini-4-argon-high`          |
| `gemini-3.8-flash`  | テキスト、画像 | Low, Medium, High | 65,536           | low → `gemini-3.8-flash-low`<br>medium → `gemini-3.8-flash-medium`<br>high → `gemini-3.8-flash-high`    |
| `claude-opus-5-5`   | テキスト、画像 | Low, Medium, High | 128,000          | low → `claude-opus-5-5-low`<br>medium → `claude-opus-5-5-medium`<br>high → `claude-opus-5-5-high`       |
| `claude-sonnet-5-5` | テキスト、画像 | Low, Medium, High | 128,000          | low → `claude-sonnet-5-5-low`<br>medium → `claude-sonnet-5-5-medium`<br>high → `claude-sonnet-5-5-high` |
| `gpt-oss-120b`      | テキスト       | Medium            | 32,768           | medium → `gpt-oss-120b-medium`                                                                          |

> **後方互換性エイリアス:** Google バックエンドで退役（404 または停止通知）となった旧モデル（`gemini-3.7-flash`、`gemini-3.6-flash`、`gemini-3.5-flash`、`gemini-3.1-pro`）は `gemini-3.8-flash` の対応思考レベルへ、Claude 4.6（`claude-opus-4-6`、`claude-sonnet-4-6`）は Claude 5.5 の対応思考レベルへ、既存設定の破損を防ぐため自動的にルーティングされます。

> **Gemini 4 Argon について:** `gemini-4-argon` は `fetchAvailableModels` には現れず、User-Agent のクライアントビルド ID で制御されています。旧ビルド ID（`cl=963137146`）では 404（`Requested entity was not found`）になりますが、本拡張機能は `cl=1004422050`（`agy` 1.4.5 相当）を送信するため利用できます。`AGY_CL` 相当の値は環境変数 `ANTIGRAVITY_HUB_CL` で上書きできます。

### 設定ファイル例 (`~/.pi/agent/settings.json`)

モデル選択肢を固定したい場合は、設定ファイルに以下のように記述します：

```json
{
  "defaultProvider": "antigravity",
  "defaultModel": "gemini-3.8-flash",
  "models": {
    "antigravity/gemini-3.8-flash": { "enabled": true },
    "antigravity/gemini-3.7-flash": { "enabled": true },
    "antigravity/gemini-3.1-pro": { "enabled": true },
    "antigravity/claude-sonnet-5-5": { "enabled": true }
  }
}
```

---

## コマンドリファレンス

| コマンド                        | 説明                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/login antigravity`            | Google アカウントでログイン認証を行います。                                                                      |
| `/model antigravity/<model-id>` | 指定した Antigravity モデルに切り替えます。                                                                      |
| `/antigravity.usage`            | サーバーから返された共有クォータプール（Gemini / 3P、5時間/週単位）の残量を表示します。                          |
| `/antigravity.models`           | アカウントで利用可能なランタイムモデル一覧と残余クォータを表示します。                                           |
| `/antigravity.models all`       | チャットや補完用を含む全ランタイムモデルを表示します。                                                           |
| `/antigravity.doctor`           | 直前のリクエストのエンドポイント、ステータス、ランタイムモデル等の診断情報を表示します（機密情報は自動マスク）。 |
| `/antigravity.image <prompt>`   | Antigravity 経由で画像を生成し、プロジェクト内の `.pi/generated-images/` に保存します。                          |

---

## 認証とセキュリティ

- **通信の直接性**: 認証情報およびプロンプトの送受信は、Google の API エンドポイントとの間でのみ行われます。
- **認可スコープ**:
  - `aicode`: Cloud Code Assist / Antigravity カタログおよび推論エンドポイントへのアクセス
  - `cloud-platform`: API 呼び出しに必要な基本権限
  - `userinfo.email`, `userinfo.profile`: アカウント識別
- **ローカルリスナーの安全性**: 認証時のコールバック（`http://localhost:51121/oauth-callback`）はローカルループバックにのみバインドされ、外部ネットワークには公開されません。

---

## 環境設定

以下の環境変数（先頭 `ANTIGRAVITY_` または互換用の `NOAGY_`）で挙動をカスタマイズできます：

| 環境変数                    | 説明                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `ANTIGRAVITY_BASE_URL`      | API ベース URL を上書き（デフォルト: `https://daily-cloudcode-pa.googleapis.com`）。 |
| `ANTIGRAVITY_PROJECT_ID`    | 自動検出の代わりに特定の Google Cloud プロジェクト ID を明示指定。                   |
| `ANTIGRAVITY_CALLBACK_HOST` | OAuth コールバックホストを指定（デフォルト: `127.0.0.1`）。                          |
| `ANTIGRAVITY_RUNTIME_MODEL` | 静的ルーティングを迂回し、特定ランタイムモデル ID に固定。                           |
| `ANTIGRAVITY_NO_KEEPALIVE`  | `1` を指定すると Keep-Alive 接続プールを無効化。                                     |
| `ANTIGRAVITY_NO_PREWARM`    | `1` を指定すると拡張機能ロード時の TLS 事前ウォームアップをスキップ。                |

---

## トラブルシューティング

- **401 / 403 エラー または 認証切れ**:
  再度 `/login antigravity` を実行して再認証してください。解決しない場合は `/antigravity.doctor` の出力を確認してください。
- **リモート / ヘッドレス環境での認証**:
  - **URL コピペ方式 (設定不要)**: サーバー上で `/login antigravity` を実行し、ターミナルに表示された URL を手元のブラウザで開いてログインします。リダイレクト先の `http://localhost:51121/oauth-callback?code=...` がエラーになったら、そのアドレスバーの URL 全体をコピーして Pi の入力欄に貼り付けてください。
  - **SSH ポートフォワード方式**: 手元から `ssh -N -L 51121:127.0.0.1:51121 user@remote` を開いた状態で、リモートでログインを実行します。
- **429 Quota Exceeded (クォータ上限)**:
  `/antigravity.usage` でリセット時間を確認してください。Gemini 各モデルは同一の共有枠を消費するため、モデルを切り替えても上限に達している場合があります。

---

## 開発・コントリビューション

本プロジェクトの開発ツールチェーンには [Bun](https://bun.sh) を採用しています。

```bash
# 依存パッケージのインストール
bun install

# 型チェック・Lint・フォーマット・テストの一括実行
bun run check
```

---

## 友情リンク

- [LINUX DO](https://linux.do/) - 真诚、友善、团结、专业，共建下一代开源与技术社区

---

## ライセンス

[MIT](LICENSE)
