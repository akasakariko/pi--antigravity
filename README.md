# pi-antigravity

[![npm version](https://img.shields.io/npm/v/pi-antigravity?logo=npm)](https://www.npmjs.com/package/pi-antigravity)
[![license](https://img.shields.io/npm/l/pi-antigravity)](LICENSE)

**pi-antigravity** は、[Pi Coding Agent](https://pi.dev) が Google Antigravity / Cloud Code Assist のモデル（Gemini、および Antigravity 経由で提供される Claude や GPT-OSS モデル）と直接連携できるようにするプロバイダー拡張機能です。Google アカウントでログインし、モデルを選択するだけですぐに利用できます。OAuth 認証、ネイティブストリーミング、モデルルーティング、クォータ診断をすべて内部で処理するため、外部の Antigravity CLI プロセスを別途呼び出す必要はありません。

> **非公式統合:** 本プロジェクトは Google と提携しておらず、公式の推奨を受けたものでもありません。自身がアクセス権限を持つアカウントおよびサービスでのみ使用し、OAuth 権限を付与する前にソースコードをご確認ください。

## 目次

- [動作要件](#動作要件)
- [インストール](#インストール)
- [クイックスタート](#クイックスタート)
- [認証とセキュリティ](#認証とセキュリティ)
- [コマンド一覧](#コマンド一覧)
- [モデルとルーティング](#モデルとルーティング)
- [環境設定](#環境設定)
- [トラブルシューティング](#トラブルシューティング)
- [開発・コントリビューション](#開発コントリビューション)
- [友情リンク](#友情リンク)
- [ライセンス](#ライセンス)

## 動作要件

- Pi Coding Agent および Pi AI バージョン **0.80.0 以降**
- 関連する Cloud Code Assist / Antigravity サービスを利用可能な Google アカウント
- Google サインインを完了するためのブラウザ（同一マシン上のブラウザを推奨。リモート/ヘッドレス環境の場合は、任意の環境でサインインを完了し、コールバック URL を Pi に貼り付けます。詳細は [トラブルシューティング](#トラブルシューティング) を参照）。

## インストール

npm からインストールする場合:

```bash
pi install npm:pi-antigravity
```

GitHub リポジトリから最新版をインストールする場合:

```bash
pi install git:github.com/KayanoLiam/pi--antigravity
```

ローカルソースコードから直接リンクしてインストールする場合（開発・カスタマイズ用）:

```bash
pi install /path/to/pi-antigravity
```

インストール後は Pi を再起動（または `/reload` を実行）してください。パッケージを後から更新する場合は `pi update git:github.com/KayanoLiam/pi--antigravity` を使用します。

## クイックスタート

1. Pi を起動し、`/login antigravity` を実行します。
2. ブラウザが自動的に開くので、Google アカウントでサインインを完了します。
3. モデルを選択します（例: Gemini 3.8 Flash）:

   ```text
   /model antigravity/gemini-3.8-flash
   ```

4. これで利用準備は完了です。リクエストで問題が発生した場合は、`/antigravity.doctor` を実行して診断情報を確認できます。

## 認証とセキュリティ

本プロバイダーは PKCE 対応の OAuth 2.0 認可コードフロー（Authorization Code flow with PKCE）を採用しており、認証情報は Google との間でのみ直接やり取りされます（Pi にパスワードを入力する必要はありません）。

1. `/login antigravity` を実行するとブラウザで Google サインイン画面が開き、ローカルの一時コールバックリスナー（`http://localhost:51121/oauth-callback`）が起動します。
2. アクセスを承認すると、Pi は認可コードをトークンと交換し、Pi の認証情報ストア（通常は `~/.pi/agent/auth.json`）に保存します。
3. アクセストークンの有効期限が切れると自動的にリフレッシュされます（トークンが明示的に取り消されない限り、再ログインは不要です）。

コールバックリスナーはループバックアドレス（localhost）のみにバインドされるため、マシンの外部からアクセスされることはありません。保存されるファイルには機密性の高いアクセストークンおよびリフレッシュトークンが含まれています。**このファイルを Git にコミットしたり、Issue に貼り付けたり、他者と共有したりしないでください。**

ログイン時に要求される Google OAuth スコープ:

| スコープ                             | 利用目的                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `aicode`                             | Cloud Code Assist / Antigravity のモデルカタログおよびエンドポイントへのアクセス |
| `cloud-platform`                     | Cloud Code Assist API 全般へのアクセス                                           |
| `userinfo.email`, `userinfo.profile` | サインインした Google アカウントの識別                                           |
| `cclog`                              | API が使用する Cloud Code Assist のロギング/テレメトリエンドポイント             |
| `experimentsandconfigs`              | API のサーバーサイド実験フラグおよび設定フラグ                                   |

アクセスを承認する前にこれらの権限を確認してください。認証情報の期限切れや取り消しが行われた場合は、再度 `/login antigravity` を実行してください。

## コマンド一覧

| コマンド                        | 説明                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/login antigravity`            | Google アカウントでサインインし、プロバイダーを設定します。                                                               |
| `/model antigravity/<model-id>` | 登録されている Antigravity モデルを選択します。                                                                           |
| `/antigravity.usage`            | サーバーから返された共有クォータグループとリセット時間を表示します。                                                      |
| `/antigravity.models`           | 利用可能なランタイムモデル、共有プールの残余クォータ、対応機能を一覧表示します。                                          |
| `/antigravity.models all`       | 通常モデル一覧から除外されている tab/chat モデルも含めて表示します。                                                      |
| `/antigravity.doctor`           | エンドポイント、ステータス、解決されたランタイムモデルなど、機密情報をマスクした診断情報を表示します。                    |
| `/antigravity.image <prompt>`   | Antigravity 経由で画像を生成し、`.pi/generated-images/` に保存します（オプション: `--ratio 16:9`, `--model`, `--path`）。 |

モデルの利用可否、権限、クォータグループ、リセット時間はサービス側から返され、アカウントによって異なる場合があります。モデルに表示されるクォータ残量は、個別の専用枠ではなく共有プールの残量を表す場合があります。

また、拡張機能はモデル自身が呼び出せる `generate_image` ツールも登録します。生成された画像はプロジェクトディレクトリ内（デフォルトは `.pi/generated-images/`）に保存されます。

## モデルとルーティング

本拡張機能に静的登録されているモデル ID は、Antigravity CLI カタログ（`agy models`）と一致しています。アカウントごとのリアルタイムな利用状況やクォータを確認するには `/antigravity.models` を実行してください。

`agy models` は、Gemini Flash（3.8, 3.7, 3.6, 3.5）、Gemini Pro、Claude Sonnet/Opus（Thinking）、GPT-OSS（Medium）にわたるモデル群を提供しています。Pi はこれらを 8 つの公開モデル ID に集約し、各モデルが対応している正確な思考レベル（Thinking Level）のみを UI に表示します。

### Claude や GPT-OSS が含まれる理由

Antigravity / Cloud Code Assist はマルチプロバイダーカタログを提供しています。アカウントの権限に応じて、Google 認証 API 経由で Google Gemini モデルに加え、Anthropic Vertex 経由の Claude モデルや OpenAI Vertex 経由の GPT-OSS モデルも利用可能です。本拡張機能は、単一の `antigravity` プロバイダーを通じてこれらを意図的に提供しており、Anthropic や OpenAI への個別ログインは必要ありません。

バックエンドの表示ラベルと内部ランタイム ID は必ずしも一致しません（例: `gemini-3.5-flash-extra-low`、`gemini-3.5-flash-low`、`gemini-3-flash-agent` は Gemini 3.5 Flash の Low、Medium、High として表示されます）。Gemini 3.8、3.7、3.6 Flash は思考強度ごとのランタイム ID を使用し `thinkingLevel` を送信します。Gemini 3.5 Flash と 3.1 Pro は `thinkingBudget` を送信します。

| 公開モデル ID       | 入力           | 表示される思考レベル | 最大出力トークン | リクエストルーティング                                                                             |
| ------------------- | -------------- | -------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `gemini-3.8-flash`  | テキスト、画像 | Low, Medium, High    | 65,536           | low → `gemini-3.8-flash-low`; medium → `gemini-3.8-flash-medium`; high → `gemini-3.8-flash-high`   |
| `gemini-3.7-flash`  | テキスト、画像 | Low, Medium, High    | 65,536           | low → `gemini-3.7-flash-low`; medium → `gemini-3.7-flash-medium`; high → `gemini-3.7-flash-high`   |
| `gemini-3.6-flash`  | テキスト、画像 | Low, Medium, High    | 65,536           | low → `gemini-3.6-flash-low`; medium → `gemini-3.6-flash-medium`; high → `gemini-3.6-flash-high`   |
| `gemini-3.5-flash`  | テキスト、画像 | Low, Medium, High    | 65,536           | low → `gemini-3.5-flash-extra-low`; medium → `gemini-3.5-flash-low`; high → `gemini-3-flash-agent` |
| `gemini-3.1-pro`    | テキスト、画像 | Low, High            | 65,535           | low → `gemini-3.1-pro-low`; high → `gemini-pro-agent`                                              |
| `claude-sonnet-4-6` | テキスト、画像 | High                 | 64,000           | high → `claude-sonnet-4-6`                                                                         |
| `claude-opus-4-6`   | テキスト、画像 | High                 | 64,000           | high → `claude-opus-4-6-thinking`                                                                  |
| `gpt-oss-120b`      | テキスト       | Medium               | 32,768           | medium → `gpt-oss-120b-medium`                                                                     |

Pi で利用するモデルを制限したい場合は、`~/.pi/agent/settings.json` で明示的に指定できます:

```json
{
  "models": {
    "antigravity/gemini-3.8-flash": { "enabled": true },
    "antigravity/gemini-3.7-flash": { "enabled": true },
    "antigravity/gemini-3.6-flash": { "enabled": true },
    "antigravity/gemini-3.5-flash": { "enabled": true },
    "antigravity/gemini-3.1-pro": { "enabled": true },
    "antigravity/claude-sonnet-4-6": { "enabled": true }
  }
}
```

## 環境設定

主な環境変数はすべて `ANTIGRAVITY_` から始まります。互換性維持のため、従来の `NOAGY_` プレフィックスも認識されます。

| 環境変数                    | 概要・用途                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ANTIGRAVITY_BASE_URL`      | API ベース URL を上書きします。HTTPS かつ許可された Google API ホストである必要があります。                |
| `ANTIGRAVITY_PROJECT_ID`    | 自動検出やアカウント固定値の代わりに、特定の Cloud Code Assist プロジェクト ID を指定します。              |
| `ANTIGRAVITY_CALLBACK_HOST` | OAuth コールバックを `127.0.0.1`、`::1`、または `localhost` にバインドします（デフォルトは `127.0.0.1`）。 |
| `ANTIGRAVITY_USER_AGENT`    | リクエスト時の User-Agent を上書きします。                                                                 |
| `ANTIGRAVITY_RUNTIME_MODEL` | 通常の静的ルーティングを迂回し、リクエストを特定のランタイムモデル ID に固定します。                       |
| `ANTIGRAVITY_CLIENT_ID`     | 独自の Google OAuth クライアント ID を使用します。                                                         |
| `ANTIGRAVITY_CLIENT_SECRET` | 独自の Google OAuth クライアントシークレットを使用します。ソースコードやシェル履歴には含めないでください。 |
| `ANTIGRAVITY_NO_KEEPALIVE`  | `1` を設定すると、Keep-Alive 接続プールを無効化します。                                                    |
| `ANTIGRAVITY_NO_PREWARM`    | `1` を設定すると、拡張機能ロード時の TLS プリウォームリクエストをスキップします。                          |

デフォルトでは `https://daily-cloudcode-pa.googleapis.com` を優先し、次にサンドボックス、その後に `https://cloudcode-pa.googleapis.com` を試行します。特別な理由がない限り、組み込みの OAuth クライアントの利用を推奨します。

### レイテンシの最適化

本プロバイダーは Keep-Alive 接続プールを再利用するため、連続した会話ターンで DNS、TCP、TLS ハンドシェイクを繰り返しません（`HTTP_PROXY` などのプロキシ変数が設定されている場合はプロキシ対応ディスパッチャーを優先します）。拡張機能の読み込み時にも接続が開かれるため、セッション最初のメッセージでも高速な応答が期待できます。最速の TTFT（Time-to-First-Token）を得るには、`gemini-3.8-flash`（思考オフ時は `LOW` 思考で `gemini-3.8-flash-low` にルーティング）の利用が最適です。また、`ANTIGRAVITY_PROJECT_ID` を指定することでプロジェクト自動検出の往復オーバーヘッドも削減できます。

## トラブルシューティング

- **認証情報なし / 401 / 403 エラー:** 再度 `/login antigravity` を実行し、`/antigravity.doctor` を確認してください。
- **リモート / ヘッドレス環境（ブラウザから `localhost:51121` にアクセスできない場合）:**
  - **URL 貼り付け方式（追加設定不要）:** `/login antigravity` を実行し、表示された URL を任意のブラウザで開いてサインインします。リダイレクト先（`http://localhost:51121/oauth-callback?…`）でページ読み込みに失敗したら、ブラウザのアドレスバーから URL 全体をコピーし、Pi のプロンプトに入力してください（コードは有効期限が短いため速やかに入力してください）。
  - **SSH トンネル方式:** ブラウザのあるマシンから `ssh -N -L 51121:127.0.0.1:51121 <user>@<server>` を実行したまま、サーバー上で `/login antigravity` を実行します。
- **OAuth コールバックが開始しない:** ポート `51121` が空いているか、`ANTIGRAVITY_CALLBACK_HOST` が有効なループバックアドレスか確認してください。
- **モデルが利用できない:** `/antigravity.models` を実行してください。利用可能性はアカウントやサービスの提供状況に依存します。
- **Claude / GPT のツール呼び出しスキーマエラー:** 最新リリースに更新してください。Pi の JSON Schema ツール定義を Cloud Code Assist のカスタムツール仕様に自動変換します。
- **クォータ・レート制限:** `/antigravity.usage` を確認してください。`429` エラーは通常クォータ上限を示します（モデルを切り替えても同一の共有プールを消費する場合があります）。
- **安全な診断ログの確認:** `/antigravity.doctor` は機密情報を自動的にマスクして出力します。公開 Issue 等に投稿する前にも内容をご確認ください。

## 開発・コントリビューション

本リポジトリでは依存関係の管理、スクリプト実行、CI に [Bun](https://bun.sh) を採用しています（配布される拡張機能自体は Node / Pi CLI 上で動作します）。

```bash
bun install
bun run check
```

`bun run check` で型検査（typecheck）、ESLint、Prettier、セキュリティチェック、ルーティングテストが一括実行されます。

## 友情リンク

- [LINUX DO](https://linux.do/) - 真诚、友善、团结、专业，共建下一代开源与技术社区

## ライセンス

[MIT](LICENSE)
