"use client";

import Link from "next/link";

const STEPS = [
  { id: "step-01", title: "ログイン" },
  { id: "step-02", title: "画面の見かた" },
  { id: "step-03", title: "患者一覧・名前登録" },
  { id: "step-04", title: "フォローアップ文例・登録" },
  { id: "step-05", title: "フォローアップ実施入力" },
  { id: "step-06", title: "フォローアップ送信予定" },
  { id: "step-07", title: "フォローアップ返信内容確認" },
  { id: "step-08", title: "受信処方箋" },
  { id: "step-09", title: "チャット" },
  { id: "step-10", title: "一斉送信" },
  { id: "step-11", title: "設定" },
];

const FEATURES = [
  {
    title: "患者管理",
    desc: "LINE友だち追加で自動登録。名前・生年月日は患者または薬局側で登録可能",
  },
  {
    title: "フォローアップ",
    desc: "薬渡し後に自動で体調確認メッセージを送信。血圧・症状の自由入力も対応",
  },
  {
    title: "処方箋受信",
    desc: "患者がLINEから処方箋写真を送信。受信時に薬局へ通知",
  },
  {
    title: "チャット",
    desc: "患者とのLINEメッセージをダッシュボードで確認・返信",
  },
  {
    title: "一斉送信",
    desc: "友だち全員または選択した患者にメッセージを一括送信",
  },
];

const FAQ = [
  {
    q: "患者一覧に名前が「LINE友だち追加」のままです。どうすればいいですか？",
    a: "患者さんに登録してもらう場合は、友だち追加時に送られるURLからお名前・生年月日を入力してもらいます。薬局側で登録する場合は、患者一覧で該当患者をクリック→患者詳細の「基本情報」で名前・生年月日を入力→保存してください。",
  },
  {
    q: "フォローアップメッセージが届かないようです。",
    a: "以下を確認してください。(1) 患者にLINEアカウントが紐付いているか（患者一覧で「紐付け済」になっているか）(2) 送信予定日になっているか（Cronは毎日9時頃に実行されます）(3) すぐに送りたい場合は「今すぐ送信」ボタンを使用してください。",
  },
  {
    q: "処方箋が届いたことを知りたいです。",
    a: "設定画面の「処方箋・チャット受信時のLINE通知」で、通知先を登録してください。処方箋やチャットが届くと、登録したLINEアカウントに通知が届きます。",
  },
  {
    q: "リッチメニューが表示されません。",
    a: "設定画面の「リッチメニューを設定する」ボタンを押してください。その後、該当の方に一度友だち削除→再追加してもらうと表示されます。",
  },
  {
    q: "友だち追加時の挨拶が出ません。",
    a: "LINE Official Account Manager の「応答設定」で「あいさつメッセージ」をオフにしてください。また、Webhookの利用が有効になっているか、LINE Developers コンソールで確認してください。",
  },
];

export default function ManualPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold transition-opacity hover:opacity-80"
            style={{ color: "var(--text-primary)" }}
          >
            テラスターファーマシー
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "white",
            }}
          >
            ログイン
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* ヒーロー */}
        <section className="mb-16 text-center">
          <h1
            className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            操作マニュアル
          </h1>
          <p
            className="mb-6 text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            テラスターファーマシー LINEフォローアップの使い方を、ステップごとに詳しく説明します。
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            対象者：薬局スタッフ（非エンジニア）　本番URL：https://terastar-line.vercel.app
          </p>
        </section>

        {/* このシステムでできること */}
        <section className="mb-16">
          <h2
            className="mb-6 text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            このシステムでできること
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <h3
                  className="mb-2 font-medium"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 目次 */}
        <nav
          className="mb-16 rounded-xl border p-6"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            目次
          </h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:underline"
                  style={{ color: "var(--accent-primary)" }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "var(--accent-light)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* STEP 01 ログイン */}
        <section id="step-01" className="mb-16 scroll-mt-24">
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                }}
              >
                01
              </span>
              ログイン
            </h2>
            <ol className="mb-6 list-decimal space-y-3 pl-6">
              <li>ブラウザで本番URL（https://terastar-line.vercel.app）を開く</li>
              <li>「ログイン」または「ログインする」をクリック</li>
              <li>メールアドレスとパスワードを入力し、「ログイン」をクリック</li>
              <li>ログインに成功すると、ダッシュボード（トップ画面）に遷移します</li>
            </ol>
            <div
              className="mb-4 rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: "var(--accent-light)",
                borderColor: "var(--accent-primary)",
              }}
            >
              <strong>ポイント：</strong> 初回利用時は「新規登録」からアカウントを作成してください。
            </div>
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderColor: "var(--color-error)",
              }}
            >
              <strong>注意：</strong> パスワードを忘れた場合は、ログイン画面の「パスワードを忘れた場合」から再設定できます。
            </div>
          </div>
        </section>

        {/* STEP 02 画面の見かた */}
        <section id="step-02" className="mb-16 scroll-mt-24">
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                }}
              >
                02
              </span>
              画面の見かた
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              ログイン後の画面は、<strong>左側のメニュー</strong>と<strong>右側のメインエリア</strong>で構成されています。
            </p>
            <h3 className="mb-3 font-medium" style={{ color: "var(--text-primary)" }}>
              左メニュー（サイドバー）
            </h3>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[400px] border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>メニュー名</th>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>説明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["ダッシュボード", "トップ画面。患者数・フォロー予定数などを表示"],
                    ["患者一覧", "LINEで友だち追加された患者の一覧"],
                    ["フォローアップ文例・登録", "体調確認メッセージのテンプレート（文例）を登録"],
                    ["フォローアップ実施入力", "薬渡し日を入力し、フォローアップ送信予定を登録"],
                    ["フォローアップ返信内容確認", "患者からの返信（体調・血圧など）を確認"],
                    ["チャット", "患者とのLINEメッセージ履歴"],
                    ["一斉送信", "友だち全員や選択した患者にメッセージを一括送信"],
                    ["受信処方箋", "LINEから送信された処方箋の一覧"],
                    ["設定", "LINE連携・リッチメニュー・通知先などの設定"],
                  ].map(([name, desc]) => (
                    <tr key={name}>
                      <td className="border px-4 py-3 font-medium" style={{ borderColor: "var(--border-color)" }}>{name}</td>
                      <td className="border px-4 py-3" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: "var(--text-secondary)" }}>
              右側メインエリアには、選択したメニューに対応する画面が表示されます。
            </p>
          </div>
        </section>

        {/* STEP 03 患者一覧 */}
        <section id="step-03" className="mb-16 scroll-mt-24">
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                }}
              >
                03
              </span>
              患者一覧・名前登録
            </h2>
            <h3 className="mb-3 font-medium">患者一覧の確認</h3>
            <ol className="mb-6 list-decimal space-y-2 pl-6">
              <li>左メニュー「患者一覧」をクリック</li>
              <li>患者の一覧が表示されます。各列の意味は以下の通りです。</li>
            </ol>
            <ul className="mb-6 list-disc space-y-1 pl-6" style={{ color: "var(--text-secondary)" }}>
              <li><strong>患者名</strong> … 登録されている名前（LINE友だち追加直後は「LINE友だち追加」や「LINE（日付）」と表示）</li>
              <li><strong>生年月日</strong> … 登録されている場合に表示</li>
              <li><strong>LINE</strong> … 「紐付け済」＝LINEと連携済み、「未紐付け」＝手動登録でLINE未連携</li>
              <li><strong>登録日</strong> … 患者が登録された日付</li>
            </ul>
            <h3 className="mb-3 font-medium">薬局側から名前・生年月日を登録する</h3>
            <ol className="mb-4 list-decimal space-y-2 pl-6">
              <li>患者一覧で、名前をクリック（患者詳細画面へ）</li>
              <li>「基本情報」のフォームで、患者名と生年月日を入力</li>
              <li>「保存する」をクリック</li>
            </ol>
            <div
              className="mb-6 rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: "var(--accent-light)",
                borderColor: "var(--accent-primary)",
              }}
            >
              LINEで友だち追加された方の名前・生年月日は、患者さん自身が登録フォームから入力するか、薬局側で患者詳細画面から登録・編集できます。
            </div>
            <h3 className="mb-3 font-medium">患者を新規登録する（手動）</h3>
            <ol className="list-decimal space-y-2 pl-6">
              <li>「新規登録」ボタンをクリック</li>
              <li>患者名・生年月日・電話番号を入力</li>
              <li>「登録する」をクリック</li>
              <li>後からLINEと紐付ける場合は、患者詳細画面の「LINE紐付け」で、友だち追加済みのLINEユーザーを選択して紐付けます。</li>
            </ol>
          </div>
        </section>

        {/* STEP 04 フォローアップ文例 */}
        <section id="step-04" className="mb-16 scroll-mt-24">
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                }}
              >
                04
              </span>
              フォローアップ文例・登録
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              フォローアップメッセージの<strong>テンプレート（文例）</strong>を登録します。ここで登録した文例を、STEP 05の「フォローアップ実施入力」で選択して使います。
            </p>
            <h3 className="mb-3 font-medium">新規登録</h3>
            <ol className="mb-6 list-decimal space-y-2 pl-6">
              <li>左メニュー「フォローアップ文例・登録」をクリック</li>
              <li>「新規登録」ボタンをクリック</li>
              <li>以下の項目を入力します。</li>
            </ol>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[400px] border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>項目</th>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>説明</th>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>例</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["パターン名", "文例の名前（管理用）", "抗生物質、降圧薬変更"],
                    ["送信日数", "薬渡しから何日後に送るか", "3、5"],
                    ["メッセージ文例", "患者に送るメッセージ本文", "下記参照"],
                    ["返信選択肢", "患者が選べるボタン（カンマ区切り）", "とても良い,良い,普通,悪い,とても悪い"],
                    ["自由入力欄", "血圧・症状などを自由入力してもらう場合にON", "チェックを入れる"],
                    ["自由入力の案内文", "自由入力時の案内文", "気になる症状や伝えたいことがあればご記入ください。"],
                    ["返信後のお礼メッセージ", "患者が返信した後に自動で送るメッセージ", "ご回答ありがとうございます。…"],
                  ].map(([item, desc, ex]) => (
                    <tr key={item}>
                      <td className="border px-4 py-3 font-medium" style={{ borderColor: "var(--border-color)" }}>{item}</td>
                      <td className="border px-4 py-3" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>{desc}</td>
                      <td className="border px-4 py-3" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-2 font-medium">メッセージ文例の変数</p>
            <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              文例には以下の変数が使えます。送信時に自動で置き換わります。
            </p>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>変数</th>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>置き換えられる内容</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["{患者名}", "患者の登録名"],
                    ["{薬名}", "フォローアップ実施入力で入力した薬名（カンマ区切りで複数可）"],
                    ["{日数}", "送信日数（パターンで設定した値）"],
                  ].map(([v, d]) => (
                    <tr key={v}>
                      <td className="border px-4 py-3 font-mono" style={{ borderColor: "var(--border-color)" }}>{v}</td>
                      <td className="border px-4 py-3" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p className="mb-1 text-sm font-medium">例：</p>
              <code className="block break-all text-sm">
                {`{患者名}様、{薬名}をお渡ししてから{日数}日経ちました。体調はいかがですか？`}
              </code>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                → 「山田太郎様、アムロジピン錠5mgをお渡ししてから5日経ちました。体調はいかがですか？」
              </p>
            </div>
            <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              一覧の「編集」をクリックすると、既存の文例を編集できます。
            </p>
          </div>
        </section>

        {/* STEP 05 フォローアップ実施入力 */}
        <section id="step-05" className="mb-16 scroll-mt-24">
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                }}
              >
                05
              </span>
              フォローアップ実施入力
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              実際に<strong>薬を渡した日</strong>を入力し、フォローアップメッセージの送信予定を登録します。
            </p>
            <ol className="mb-6 list-decimal space-y-2 pl-6">
              <li>左メニュー「フォローアップ実施入力」をクリック</li>
              <li>以下の項目を入力します。</li>
            </ol>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>項目</th>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>説明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["患者", "薬を渡した患者を選択（必須）"],
                    ["薬名", "渡した薬の名前。カンマ区切りで複数入力可（任意）"],
                    ["フォロー日程パターン", "使用する文例を選択（必須）"],
                  ].map(([item, desc]) => (
                    <tr key={item}>
                      <td className="border px-4 py-3 font-medium" style={{ borderColor: "var(--border-color)" }}>{item}</td>
                      <td className="border px-4 py-3" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ol className="mb-4 list-decimal space-y-2 pl-6" start={3}>
              <li>「登録する」をクリック</li>
              <li>登録後、「送信予定一覧」で予定を確認できます。</li>
            </ol>
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: "var(--accent-light)",
                borderColor: "var(--accent-primary)",
              }}
            >
              パターンで設定した「送信日数」後（例：3日後）の朝9時頃に、Cron（自動実行）でメッセージが送信されます。すぐに送りたい場合は、STEP 06の「今すぐ送信」を使います。
            </div>
          </div>
        </section>

        {/* STEP 06 送信予定 */}
        <section id="step-06" className="mb-16 scroll-mt-24">
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mb-6 flex items-center gap-3 text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                }}
              >
                06
              </span>
              フォローアップ送信予定
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              登録したフォローアップの送信予定を確認・編集できます。
            </p>
            <ol className="mb-6 list-decimal space-y-2 pl-6">
              <li>左メニュー「フォローアップ実施入力」→「送信予定一覧」をクリック、または「フォローアップ実施入力」画面の「送信予定一覧」リンクをクリック</li>
              <li>一覧が表示されます。</li>
            </ol>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>列</th>
                    <th className="border px-4 py-3 text-left" style={{ borderColor: "var(--border-color)" }}>説明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["患者名", "対象患者"],
                    ["送信予定日時", "送信予定の日時"],
                    ["パターン", "使用する文例名"],
                    ["薬名", "登録した薬名"],
                    ["状態", "未送信 / 送信済み"],
                  ].map(([col, desc]) => (
                    <tr key={col}>
                      <td className="border px-4 py-3 font-medium" style={{ borderColor: "var(--border-color)" }}>{col}</td>
                      <td className="border px-4 py-3" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mb-3 font-medium">送信予定日時を編集する</h3>
            <ol className="mb-6 list-decimal space-y-2 pl-6">
              <li>該当行の「編集」ボタンをクリック</li>
              <li>日時を変更し、「保存」をクリック</li>
            </ol>
            <h3 className="mb-3 font-medium">今すぐ送信する</h3>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              送信予定日を待たずに、すぐにLINEでメッセージを送りたい場合：
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6">
              <li>該当行の「今すぐ送信」ボタンをクリック</li>
              <li>確認ダイアログで「OK」をクリック</li>
              <li>患者のLINEにメッセージが送信されます。</li>
            </ol>
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderColor: "var(--color-error)",
              }}
            >
              「今すぐ送信」は未送信の予定にのみ表示されます。送信済みの場合は表示されません。また、患者にLINEアカウントが紐付いていない場合は送信できません。
            </div>
          </div>
        </section>

        {/* STEP 07〜11 簡略 */}
        {[
          {
            id: "step-07",
            num: "07",
            title: "フォローアップ返信内容確認",
            content: (
              <>
                <p className="mb-4">患者がフォローアップメッセージに返信した内容を確認します。</p>
                <ol className="mb-4 list-decimal space-y-2 pl-6">
                  <li>左メニュー「フォローアップ返信内容確認」をクリック</li>
                  <li>返信一覧が表示されます。患者名・返信日時・返信内容（選択肢または自由入力テキスト）を確認できます。</li>
                </ol>
                <div className="rounded-lg border-l-4 p-4" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-primary)" }}>
                  患者が「とても良い」などのボタンを押した場合も、血圧値や症状をテキストで入力した場合も、ここに記録されます。
                </div>
              </>
            ),
          },
          {
            id: "step-08",
            num: "08",
            title: "受信処方箋",
            content: (
              <>
                <p className="mb-4">患者がLINEのリッチメニュー「処方箋送信」から送信した処方箋の一覧です。</p>
                <ol className="mb-4 list-decimal space-y-2 pl-6">
                  <li>左メニュー「受信処方箋」をクリック</li>
                  <li>一覧が表示されます。</li>
                </ol>
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full min-w-[300px] border-collapse text-sm">
                    <tbody>
                      {[
                        ["お名前", "患者が入力した名前"],
                        ["生年月日", "患者が入力した生年月日"],
                        ["メモ", "患者が入力したメモ"],
                        ["処方箋", "画像がある場合「画像を表示」リンク"],
                        ["送信日時", "送信された日時"],
                      ].map(([col, desc]) => (
                        <tr key={col}>
                          <td className="border px-4 py-2 font-medium" style={{ borderColor: "var(--border-color)" }}>{col}</td>
                          <td className="border px-4 py-2" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-lg border-l-4 p-4" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-primary)" }}>
                  処方箋が届くと、設定で登録したLINEアカウントに通知が届きます。見落とし防止にご利用ください。
                </div>
              </>
            ),
          },
          {
            id: "step-09",
            num: "09",
            title: "チャット",
            content: (
              <>
                <p className="mb-4">患者とのLINEメッセージ履歴をダッシュボードで確認・返信できます。</p>
                <ol className="mb-4 list-decimal space-y-2 pl-6">
                  <li>左メニュー「チャット」をクリック</li>
                  <li>患者一覧が表示されます。未読がある場合は「要対応」タブに表示されます。</li>
                  <li>患者名をクリックすると、メッセージ履歴が表示されます。</li>
                  <li>患者が送った画像は、メッセージ内に表示されます。画像をクリックすると別タブで拡大表示できます。</li>
                  <li>返信する場合は、画面下部の入力欄にメッセージを入力し、送信ボタンをクリックします。</li>
                </ol>
                <div className="mb-4 rounded-lg border-l-4 p-4" style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--accent-primary)" }}>
                  患者がチャットでメッセージを送ると、設定で登録したLINEアカウントに通知が届きます。処方箋受信時と同じ通知先です。
                </div>
                <div className="rounded-lg border-l-4 p-4" style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "var(--color-error)" }}>
                  チャット機能を使うには、LINE Official Account Manager の応答設定で「応答メッセージ」をオフにする必要があります。
                </div>
              </>
            ),
          },
          {
            id: "step-10",
            num: "10",
            title: "一斉送信",
            content: (
              <>
                <p className="mb-4">友だち全員または選択した患者に、メッセージを一括送信できます。</p>
                <ol className="mb-4 list-decimal space-y-2 pl-6">
                  <li>左メニュー「一斉送信」をクリック</li>
                  <li>「送信先」で以下を選択します。友だち全員 / 患者を選択</li>
                  <li>「メッセージ」欄に送りたい内容を入力</li>
                  <li>「送信内容を確認する」をクリック</li>
                  <li>確認画面で内容を確認し、送信を実行します。</li>
                </ol>
                <div className="rounded-lg border-l-4 p-4" style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "var(--color-error)" }}>
                  送信人数分がLINEの料金対象になります。送信前に必ず内容を確認してください。
                </div>
              </>
            ),
          },
          {
            id: "step-11",
            num: "11",
            title: "設定",
            content: (
              <>
                <h3 className="mb-3 font-medium">処方箋・チャット受信時のLINE通知</h3>
                <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  処方箋やチャットが届いたときに、登録したLINEアカウントに通知を送ります。
                </p>
                <ol className="mb-6 list-decimal space-y-2 pl-6">
                  <li>「登録用コードを発行」をクリック</li>
                  <li>表示された6文字のコードをメモ</li>
                  <li><strong>スマホのLINEアプリ</strong>で、薬局のLINE公式アカウントを開く（友だち追加済みであること）</li>
                  <li>トークに「通知登録 XXXXXX」（コードを入力）と送信</li>
                  <li>「通知先として登録しました」と返信されれば完了</li>
                </ol>
                <div className="mb-6 rounded-lg border-l-4 p-4" style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "var(--color-error)" }}>
                  ダッシュボードのチャットやLINE公式アカウント管理画面から送っても登録できません。必ず<strong>スマホのLINEアプリ</strong>のトーク画面から送信してください。コードは15分で期限切れになります。
                </div>
                <h3 className="mb-3 font-medium">リッチメニュー設定</h3>
                <ol className="mb-6 list-decimal space-y-2 pl-6">
                  <li>「リッチメニューを設定する」ボタンをクリック</li>
                  <li>設定が完了するまで待ちます。初回のみ実行してください。</li>
                  <li>友だち追加後にリッチメニューが表示されない場合は、このボタンを押した後、該当の方に一度友だち削除→再追加してもらってください。</li>
                </ol>
                <h3 className="mb-3 font-medium">友だち追加時の挨拶文</h3>
                <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                  環境変数 LINE_WELCOME_MESSAGE で挨拶文をカスタマイズできます。LINE Official Account Manager の「あいさつメッセージ」はオフにしてください。
                </p>
                <h3 className="mb-3 font-medium">タブレットでフルスクリーン表示</h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  タブレット・スマホで開いた時、画面右下にフルスクリーンボタンが表示されます。「ホーム画面に追加」でアプリのように起動すると、起動時からフルスクリーンで開きます。
                </p>
              </>
            ),
          },
        ].map((s) => (
          <section key={s.id} id={s.id} className="mb-16 scroll-mt-24">
            <div
              className="rounded-xl border p-6 md:p-8"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <h2
                className="mb-6 flex items-center gap-3 text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "white",
                  }}
                >
                  {s.num}
                </span>
                {s.title}
              </h2>
              {s.content}
            </div>
          </section>
        ))}

        {/* FAQ */}
        <section id="faq" className="mb-16 scroll-mt-24">
          <h2
            className="mb-6 text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            よくある質問
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <summary className="cursor-pointer list-none p-5 font-medium">
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs"
                      style={{
                        backgroundColor: "var(--accent-light)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      Q
                    </span>
                    {item.q}
                  </span>
                </summary>
                <div
                  className="border-t px-5 pb-5 pt-3"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* フッター */}
        <footer
          className="rounded-xl border p-8 text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <p className="mb-4 font-medium" style={{ color: "var(--text-primary)" }}>
            本番URL
          </p>
          <a
            href="https://terastar-line.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 block break-all font-mono text-sm"
            style={{ color: "var(--accent-primary)" }}
          >
            https://terastar-line.vercel.app
          </a>
          <Link
            href="/login"
            className="inline-block rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "white",
            }}
          >
            ログインする
          </Link>
          <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
            最終更新：2026年3月
          </p>
        </footer>
      </main>
    </div>
  );
}
