using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public sealed class CodexQuotaWindow
{
    public readonly string Text;
    public readonly int RemainingPercent;
    public readonly string Label;
    public readonly string ResetCountdown;
    public readonly string ResetAbsolute;
    public readonly string ResetText;

    public CodexQuotaWindow(string text, int remainingPercent)
        : this(text, remainingPercent, null, null, null, null)
    {
    }

    public CodexQuotaWindow(string text, int remainingPercent, string label, string resetCountdown, string resetAbsolute)
        : this(text, remainingPercent, label, resetCountdown, resetAbsolute, null)
    {
    }

    public CodexQuotaWindow(string text, int remainingPercent, string label, string resetCountdown, string resetAbsolute, string resetText)
    {
        Text = text ?? string.Empty;
        RemainingPercent = remainingPercent;
        Label = label ?? string.Empty;
        ResetCountdown = resetCountdown ?? string.Empty;
        ResetAbsolute = resetAbsolute ?? string.Empty;
        ResetText = resetText ?? string.Empty;
    }
}

public sealed class CodexWidgetForm : Form
{
    private static readonly Color CardBackColor = Color.FromArgb(22, 25, 32);
    private static readonly Color CardBorderColor = Color.FromArgb(48, 54, 66);
    private static readonly Color TrackColor = Color.FromArgb(40, 46, 58);
    private static readonly Color DividerColor = Color.FromArgb(40, 46, 58);
    private static readonly Color AccentGreenColor = Color.FromArgb(16, 163, 127);
    private static readonly Color BarAmberColor = Color.FromArgb(245, 166, 35);
    private static readonly Color BarRedColor = Color.FromArgb(239, 68, 68);
    private static readonly Color PrimaryTextColor = Color.FromArgb(236, 240, 246);
    private static readonly Color WindowLabelColor = Color.FromArgb(200, 208, 220);
    private static readonly Color MutedTextColor = Color.FromArgb(140, 150, 165);

    private readonly Font titleFont;
    private readonly Font windowLabelFont;
    private readonly Font percentFont;
    private readonly Font secondaryFont;
    private readonly CardPanel layout;
    private readonly Label title;
    private readonly Panel headerDivider;
    private readonly Panel windowDivider;
    private readonly Label quotaMessage;
    private readonly QuotaWindowRow[] windowRows = new QuotaWindowRow[2];
    private Size minimumClientSize;
    private bool isPinned;
    public readonly Label Recorded;

    static CodexWidgetForm()
    {
        using (new Font("Segoe UI", 9f)) { }
        SetProcessDPIAware();
    }

    public CodexWidgetForm()
    {
        Text = "Codex quota";
        StartPosition = FormStartPosition.Manual;
        FormBorderStyle = FormBorderStyle.SizableToolWindow;
        AutoScaleMode = AutoScaleMode.None;
        MaximizeBox = false;
        MinimizeBox = false;
        ShowInTaskbar = false;
        DoubleBuffered = true;
        ResizeRedraw = true;
        BackColor = CardBackColor;
        ForeColor = PrimaryTextColor;

        string baseFamily = ResolveBaseFontFamily();
        titleFont = CreateFont(baseFamily, 14.5f, true);
        windowLabelFont = CreateFont(baseFamily, 13f, true);
        percentFont = CreateFont(baseFamily, 15.5f, true);
        secondaryFont = CreateFont(baseFamily, 11.5f, false);
        Font = secondaryFont;

        layout = new CardPanel {
            Dock = DockStyle.Fill,
            Padding = new Padding(ScalePx(16)),
            Margin = Padding.Empty,
            BackColor = CardBackColor,
            ColumnCount = 1,
            RowCount = 6
        };
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));

        var header = new DoubleBufferedTableLayoutPanel {
            Dock = DockStyle.Top,
            AutoSize = true,
            Margin = Padding.Empty,
            Padding = Padding.Empty,
            BackColor = CardBackColor,
            ColumnCount = 3,
            RowCount = 1
        };
        header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
        header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        header.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        var dot = new AccentDot {
            Size = new Size(ScalePx(10), ScalePx(10)),
            Anchor = AnchorStyles.Left,
            Margin = new Padding(0, ScalePx(1), ScalePx(8), 0),
            BackColor = CardBackColor
        };
        title = new Label {
            Text = "Codex Quota",
            AutoSize = true,
            Anchor = AnchorStyles.Left,
            Margin = Padding.Empty,
            Font = titleFont,
            ForeColor = PrimaryTextColor,
            BackColor = CardBackColor
        };
        Recorded = new Label {
            Text = "Loading...",
            AutoSize = true,
            Anchor = AnchorStyles.Right,
            TextAlign = ContentAlignment.MiddleRight,
            Margin = new Padding(ScalePx(8), 0, 0, 0),
            Font = secondaryFont,
            ForeColor = MutedTextColor,
            BackColor = CardBackColor
        };
        header.Controls.Add(dot, 0, 0);
        header.Controls.Add(title, 1, 0);
        header.Controls.Add(Recorded, 2, 0);

        headerDivider = CreateDivider(ScalePx(10), ScalePx(12));
        windowDivider = CreateDivider(ScalePx(12), ScalePx(12));
        windowDivider.Visible = false;

        quotaMessage = new Label {
            Text = "Reading recorded Codex quota...",
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleLeft,
            Margin = Padding.Empty,
            Font = secondaryFont,
            ForeColor = MutedTextColor,
            BackColor = CardBackColor
        };

        layout.Controls.Add(header, 0, 0);
        layout.Controls.Add(headerDivider, 0, 1);

        for (int i = 0; i < windowRows.Length; i++)
        {
            windowRows[i] = new QuotaWindowRow(
                windowLabelFont,
                percentFont,
                secondaryFont,
                ScalePx(8),
                ScalePx(2),
                ScalePx(4),
                ScalePx(5),
                ScalePx(6));
            windowRows[i].Visible = false;
        }
        layout.Controls.Add(windowRows[0], 0, 2);
        layout.Controls.Add(windowDivider, 0, 3);
        layout.Controls.Add(windowRows[1], 0, 4);
        layout.Controls.Add(quotaMessage, 0, 5);

        Controls.Add(layout);
    }

    protected override void OnSizeChanged(EventArgs e)
    {
        base.OnSizeChanged(e);
        UpdateCardRegion();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            if (Region != null)
            {
                Region.Dispose();
                Region = null;
            }
            titleFont.Dispose();
            windowLabelFont.Dispose();
            percentFont.Dispose();
            secondaryFont.Dispose();
        }
        base.Dispose(disposing);
    }

    public void SetQuota(string message, CodexQuotaWindow[] windows)
    {
        int count = windows == null ? 0 : Math.Min(windows.Length, windowRows.Length);
        layout.SuspendLayout();
        try
        {
            quotaMessage.Text = string.IsNullOrEmpty(message)
                ? "Codex quota unavailable. Check Codex login."
                : message;
            quotaMessage.Visible = count == 0;
            windowDivider.Visible = count > 1;
            for (int i = 0; i < windowRows.Length; i++)
            {
                if (i < count && windows[i] != null)
                {
                    windowRows[i].Bind(windows[i]);
                    windowRows[i].Visible = true;
                }
                else
                {
                    windowRows[i].Visible = false;
                }
            }
        }
        finally
        {
            layout.ResumeLayout(true);
        }
    }

    public static ContextMenuStrip CreateTrayMenu()
    {
        string baseFamily = ResolveBaseFontFamily();
        return new ContextMenuStrip { Font = CreateFont(baseFamily, 14f, false) };
    }

    public static Icon CreateTrayIcon()
    {
        using (var bmp = new Bitmap(32, 32))
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            g.Clear(Color.Transparent);

            using (GraphicsPath badgePath = CreateRoundedPath(new RectangleF(1.5f, 1.5f, 29f, 29f), 7f))
            using (var backBrush = new SolidBrush(CardBackColor))
            using (var borderPen = new Pen(AccentGreenColor, 2f))
            {
                g.FillPath(backBrush, badgePath);
                g.DrawPath(borderPen, badgePath);
            }

            using (var arcPen = new Pen(Color.FromArgb(140, 16, 163, 127), 2f))
            {
                arcPen.StartCap = LineCap.Round;
                arcPen.EndCap = LineCap.Round;
                g.DrawArc(arcPen, 5.5f, 5.5f, 21f, 21f, 135f, 270f);
            }

            string baseFamily = ResolveBaseFontFamily();
            using (Font glyphFont = CreateFont(baseFamily, 15f, true))
            using (var glyphBrush = new SolidBrush(PrimaryTextColor))
            using (var format = new StringFormat {
                Alignment = StringAlignment.Center,
                LineAlignment = StringAlignment.Center
            })
            {
                g.DrawString("C", glyphFont, glyphBrush, new RectangleF(0.5f, 0.5f, 31f, 32f), format);
            }

            IntPtr hIcon = bmp.GetHicon();
            try
            {
                using (Icon temp = Icon.FromHandle(hIcon))
                {
                    return (Icon)temp.Clone();
                }
            }
            finally
            {
                DestroyIcon(hIcon);
            }
        }
    }

    [DllImport("user32.dll")]
    private static extern bool DestroyIcon(IntPtr hIcon);

    [DllImport("user32.dll")]
    private static extern bool SetProcessDPIAware();

    public void RestoreLayout(string path)
    {
        int headerHeight = Math.Max(
            TextRenderer.MeasureText("Codex Quota", titleFont).Height,
            TextRenderer.MeasureText("Updated 12:00 PM", secondaryFont).Height)
            + headerDivider.Height + headerDivider.Margin.Vertical;
        int rowHeight = windowRows[0].MeasureHeight();
        int dividerHeight = windowDivider.Height + windowDivider.Margin.Vertical;
        int minPreferredHeight = layout.Padding.Vertical + headerHeight + rowHeight * 2 + dividerHeight + ScalePx(4);

        var minimumClient = new Size(ScalePx(280), ScalePx(190));
        Size frame = SizeFromClientSize(Size.Empty);
        var desired = new Size(ScalePx(440), Math.Max(ScalePx(270), minPreferredHeight));
        Rectangle area = Screen.PrimaryScreen.WorkingArea;
        var bounds = new Rectangle(area.Right - desired.Width - frame.Width - ScalePx(24), area.Top + ScalePx(72),
            desired.Width, desired.Height);
        Rectangle saved;
        if (TryReadLayout(path, out saved))
        {
            bounds = saved;
            area = Screen.FromPoint(bounds.Location).WorkingArea;
        }
        int availableWidth = Math.Max(1, area.Width - frame.Width);
        int availableHeight = Math.Max(1, area.Height - frame.Height);
        int clampedMinWidth = Math.Min(availableWidth, minimumClient.Width);
        int clampedMinHeight = Math.Min(availableHeight, minimumClient.Height);
        minimumClientSize = new Size(clampedMinWidth, clampedMinHeight);
        MinimumSize = SizeFromClientSize(minimumClientSize);
        ClientSize = new Size(
            Clamp(bounds.Width, clampedMinWidth, availableWidth),
            Clamp(bounds.Height, clampedMinHeight, availableHeight));
        Location = new Point(
            Clamp(bounds.X, area.Left, area.Right - ClientSize.Width),
            Clamp(bounds.Y, area.Top, area.Bottom - ClientSize.Height));
    }

    public Size GetClientScreenOffset()
    {
        if (!IsHandleCreated) return Size.Empty;
        Point clientOrigin = PointToScreen(Point.Empty);
        return new Size(clientOrigin.X - Location.X, clientOrigin.Y - Location.Y);
    }

    public void SetDesktopFrame(bool pinned)
    {
        Size contentSize = ClientSize;
        MinimumSize = Size.Empty;
        if (!pinned)
        {
            isPinned = false;
            layout.SetRounded(false, 0);
            UpdateCardRegion();
            FormBorderStyle = FormBorderStyle.SizableToolWindow;
            MinimumSize = SizeFromClientSize(minimumClientSize);
            ClientSize = contentSize;
        }
        else
        {
            isPinned = false;
            FormBorderStyle = FormBorderStyle.None;
            MinimumSize = SizeFromClientSize(minimumClientSize);
            ClientSize = contentSize;
            isPinned = true;
            layout.SetRounded(true, ScalePx(12));
            UpdateCardRegion();
        }
        Invalidate(true);
    }

    public void SaveLayout(string path, bool pinned)
    {
        if (string.IsNullOrEmpty(path)) return;
        Point origin = pinned ? PointToScreen(Point.Empty) : Location;
        string scratch = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            File.WriteAllText(scratch, string.Format(CultureInfo.InvariantCulture, "{0},{1},{2},{3}",
                origin.X, origin.Y, ClientSize.Width, ClientSize.Height));
            if (File.Exists(path)) File.Replace(scratch, path, null);
            else File.Move(scratch, path);
        }
        catch (IOException) { }
        catch (UnauthorizedAccessException) { }
        finally
        {
            try { File.Delete(scratch); }
            catch (IOException) { }
            catch (UnauthorizedAccessException) { }
        }
    }

    private void UpdateCardRegion()
    {
        if (!isPinned || FormBorderStyle != FormBorderStyle.None || Width <= 0 || Height <= 0)
        {
            if (Region != null)
            {
                Region old = Region;
                Region = null;
                old.Dispose();
            }
            return;
        }

        using (GraphicsPath path = CreateRoundedPath(new RectangleF(0f, 0f, Width, Height), ScalePx(12)))
        {
            Region next = new Region(path);
            Region old = Region;
            Region = next;
            if (old != null) old.Dispose();
        }
    }

    private int ScalePx(int px96)
    {
        int dpi = DeviceDpi > 0 ? DeviceDpi : 96;
        return Math.Max(1, (int)Math.Round(px96 * (dpi / 96.0)));
    }

    private static Panel CreateDivider(int topMargin, int bottomMargin)
    {
        return new Panel {
            Height = 1,
            Dock = DockStyle.Top,
            BackColor = DividerColor,
            Margin = new Padding(0, topMargin, 0, bottomMargin)
        };
    }

    private static string ResolveBaseFontFamily()
    {
        if (IsFontInstalled("Segoe UI Variable Display"))
            return "Segoe UI Variable Display";
        return "Segoe UI";
    }

    private static Font CreateFont(string baseFamily, float sizePt, bool semibold)
    {
        if (semibold)
        {
            string semiboldFamily = baseFamily + " Semibold";
            if (IsFontInstalled(semiboldFamily))
                return new Font(semiboldFamily, sizePt, FontStyle.Regular, GraphicsUnit.Point);
            return new Font(baseFamily, sizePt, FontStyle.Bold, GraphicsUnit.Point);
        }
        return new Font(baseFamily, sizePt, FontStyle.Regular, GraphicsUnit.Point);
    }

    private static bool IsFontInstalled(string familyName)
    {
        using (var installed = new InstalledFontCollection())
        {
            foreach (FontFamily family in installed.Families)
            {
                if (string.Equals(family.Name, familyName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
        }
        return false;
    }

    private static GraphicsPath CreateRoundedPath(RectangleF bounds, float radius)
    {
        var path = new GraphicsPath();
        if (bounds.Width <= 0f || bounds.Height <= 0f)
        {
            path.AddRectangle(bounds);
            return path;
        }
        float r = Math.Max(0f, Math.Min(radius, Math.Min(bounds.Width, bounds.Height) / 2f));
        if (r <= 0.5f)
        {
            path.AddRectangle(bounds);
            return path;
        }
        float d = r * 2f;
        path.AddArc(bounds.X, bounds.Y, d, d, 180f, 90f);
        path.AddArc(bounds.Right - d, bounds.Y, d, d, 270f, 90f);
        path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0f, 90f);
        path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90f, 90f);
        path.CloseFigure();
        return path;
    }

    private static bool TryReadLayout(string path, out Rectangle bounds)
    {
        bounds = Rectangle.Empty;
        if (string.IsNullOrEmpty(path)) return false;
        try
        {
            string[] fields = File.ReadAllText(path).Split(',');
            if (fields.Length != 4) return false;
            var values = new int[4];
            for (int i = 0; i < values.Length; i++)
            {
                if (!int.TryParse(fields[i], NumberStyles.Integer, CultureInfo.InvariantCulture, out values[i]))
                    return false;
            }
            if (values[2] <= 0 || values[3] <= 0) return false;
            bounds = new Rectangle(values[0], values[1], values[2], values[3]);
            return true;
        }
        catch (IOException) { return false; }
        catch (UnauthorizedAccessException) { return false; }
    }

    private static int Clamp(int value, int min, int max)
    {
        return Math.Max(min, Math.Min(max, value));
    }

    private class DoubleBufferedTableLayoutPanel : TableLayoutPanel
    {
        public DoubleBufferedTableLayoutPanel()
        {
            DoubleBuffered = true;
            ResizeRedraw = true;
        }
    }

    private sealed class CardPanel : DoubleBufferedTableLayoutPanel
    {
        private bool rounded;
        private int cornerRadius;

        public void SetRounded(bool isRounded, int radius)
        {
            rounded = isRounded;
            cornerRadius = radius;
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (Width <= 1 || Height <= 1) return;
            using (var pen = new Pen(CardBorderColor, 1f))
            {
                if (rounded && cornerRadius > 1)
                {
                    e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
                    using (GraphicsPath borderPath = CreateRoundedPath(
                        new RectangleF(0.5f, 0.5f, Width - 2f, Height - 2f),
                        Math.Max(1f, cornerRadius - 0.5f)))
                    {
                        e.Graphics.DrawPath(pen, borderPath);
                    }
                }
                else
                {
                    e.Graphics.DrawRectangle(pen, 0, 0, Width - 1, Height - 1);
                }
            }
        }
    }

    private sealed class AccentDot : Control
    {
        public AccentDot()
        {
            SetStyle(
                ControlStyles.OptimizedDoubleBuffer |
                ControlStyles.AllPaintingInWmPaint |
                ControlStyles.UserPaint |
                ControlStyles.ResizeRedraw,
                true);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            float size = Math.Min(Width, Height) - 1f;
            if (size <= 0f) return;
            using (var brush = new SolidBrush(AccentGreenColor))
            {
                e.Graphics.FillEllipse(brush, 0.5f, 0.5f, size, size);
            }
        }
    }

    private sealed class QuotaBar : Control
    {
        private int percent;

        public QuotaBar()
        {
            SetStyle(
                ControlStyles.OptimizedDoubleBuffer |
                ControlStyles.AllPaintingInWmPaint |
                ControlStyles.UserPaint |
                ControlStyles.ResizeRedraw,
                true);
            BackColor = CardBackColor;
        }

        public int Percent
        {
            get { return percent; }
            set
            {
                int clamped = Clamp(value, 0, 100);
                if (percent == clamped) return;
                percent = clamped;
                Invalidate();
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (Width <= 1 || Height <= 1) return;

            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            var trackBounds = new RectangleF(0f, 0f, Width - 1f, Height - 1f);
            float radius = trackBounds.Height / 2f;

            using (GraphicsPath trackPath = CreateRoundedPath(trackBounds, radius))
            using (var trackBrush = new SolidBrush(TrackColor))
            {
                e.Graphics.FillPath(trackBrush, trackPath);
                if (percent <= 0) return;

                float fillWidth = trackBounds.Width * (percent / 100f);
                if (fillWidth < 1f) return;

                Color fillColor = percent > 50
                    ? AccentGreenColor
                    : (percent >= 20 ? BarAmberColor : BarRedColor);

                Region previousClip = e.Graphics.Clip;
                e.Graphics.SetClip(trackPath, CombineMode.Intersect);
                try
                {
                    var fillBounds = new RectangleF(0f, 0f, fillWidth, trackBounds.Height);
                    float fillRadius = Math.Min(radius, fillWidth / 2f);
                    using (GraphicsPath fillPath = CreateRoundedPath(fillBounds, fillRadius))
                    using (var fillBrush = new SolidBrush(fillColor))
                    {
                        e.Graphics.FillPath(fillBrush, fillPath);
                    }
                }
                finally
                {
                    e.Graphics.Clip = previousClip;
                    if (previousClip != null) previousClip.Dispose();
                }
            }
        }
    }

    private sealed class QuotaWindowRow : DoubleBufferedTableLayoutPanel
    {
        private readonly Label windowLabel;
        private readonly Label percentValue;
        private readonly Label leftSuffix;
        private readonly QuotaBar bar;
        private readonly Label resetLabel;

        public QuotaWindowRow(
            Font labelFont,
            Font bigPercentFont,
            Font mutedFont,
            int barHeight,
            int baselineBottomPad,
            int leftSuffixGap,
            int barTopMargin,
            int barBottomMargin)
        {
            Dock = DockStyle.Top;
            AutoSize = true;
            Margin = Padding.Empty;
            Padding = Padding.Empty;
            BackColor = CardBackColor;
            ColumnCount = 1;
            RowCount = 3;
            ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
            RowStyles.Add(new RowStyle(SizeType.AutoSize));
            RowStyles.Add(new RowStyle(SizeType.AutoSize));
            RowStyles.Add(new RowStyle(SizeType.AutoSize));

            var topLine = new DoubleBufferedTableLayoutPanel {
                Dock = DockStyle.Top,
                AutoSize = true,
                Margin = Padding.Empty,
                Padding = Padding.Empty,
                BackColor = CardBackColor,
                ColumnCount = 3,
                RowCount = 1
            };
            topLine.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
            topLine.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            topLine.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            topLine.RowStyles.Add(new RowStyle(SizeType.AutoSize));

            windowLabel = new Label {
                Text = "5 Hour",
                AutoSize = true,
                Anchor = AnchorStyles.Left | AnchorStyles.Bottom,
                Font = labelFont,
                ForeColor = WindowLabelColor,
                BackColor = CardBackColor,
                Margin = new Padding(0, 0, 0, baselineBottomPad)
            };
            percentValue = new Label {
                Text = "100%",
                AutoSize = true,
                Anchor = AnchorStyles.Right | AnchorStyles.Bottom,
                Font = bigPercentFont,
                ForeColor = PrimaryTextColor,
                BackColor = CardBackColor,
                Margin = Padding.Empty
            };
            leftSuffix = new Label {
                Text = "left",
                AutoSize = true,
                Anchor = AnchorStyles.Left | AnchorStyles.Bottom,
                Font = mutedFont,
                ForeColor = MutedTextColor,
                BackColor = CardBackColor,
                Margin = new Padding(leftSuffixGap, 0, 0, baselineBottomPad)
            };

            topLine.Controls.Add(windowLabel, 0, 0);
            topLine.Controls.Add(percentValue, 1, 0);
            topLine.Controls.Add(leftSuffix, 2, 0);

            bar = new QuotaBar {
                Dock = DockStyle.Top,
                Height = barHeight,
                Margin = new Padding(0, barTopMargin, 0, barBottomMargin)
            };

            resetLabel = new Label {
                Text = "Resets in 1h 00m",
                AutoSize = true,
                Anchor = AnchorStyles.Left,
                Font = mutedFont,
                ForeColor = MutedTextColor,
                BackColor = CardBackColor,
                Margin = Padding.Empty
            };

            Controls.Add(topLine, 0, 0);
            Controls.Add(bar, 0, 1);
            Controls.Add(resetLabel, 0, 2);
        }

        public int MeasureHeight()
        {
            int topHeight = Math.Max(
                windowLabel.GetPreferredSize(Size.Empty).Height + windowLabel.Margin.Vertical,
                percentValue.GetPreferredSize(Size.Empty).Height);
            int barHeight = bar.Height + bar.Margin.Vertical;
            int resetHeight = resetLabel.GetPreferredSize(Size.Empty).Height;
            return topHeight + barHeight + resetHeight;
        }

        public void Bind(CodexQuotaWindow window)
        {
            int pct = Clamp(window.RemainingPercent, 0, 100);
            windowLabel.Text = ResolveLabel(window);
            percentValue.Text = string.Format(CultureInfo.InvariantCulture, "{0}%", pct);
            bar.Percent = pct;
            bar.AccessibleName = window.Text;
            resetLabel.Text = ResolveResetText(window);
        }

        private static string ResolveLabel(CodexQuotaWindow window)
        {
            string rawLabel = null;
            if (!string.IsNullOrEmpty(window.Label))
            {
                rawLabel = window.Label;
            }
            else
            {
                int colon = window.Text.IndexOf(':');
                if (colon > 0) rawLabel = window.Text.Substring(0, colon).Trim();
            }
            if (string.IsNullOrEmpty(rawLabel)) return "Quota";
            if (string.Equals(rawLabel.Trim(), "5h", StringComparison.OrdinalIgnoreCase))
                return "5 Hour";
            return rawLabel;
        }

        private static string ResolveResetText(CodexQuotaWindow window)
        {
            if (!string.IsNullOrEmpty(window.ResetCountdown) && !string.IsNullOrEmpty(window.ResetAbsolute))
                return string.Format(CultureInfo.InvariantCulture, "Resets in {0} \u00b7 {1}", window.ResetCountdown, window.ResetAbsolute);
            if (!string.IsNullOrEmpty(window.ResetText))
                return CapitalizeFirst(window.ResetText);
            int sep = window.Text.IndexOf('\u00b7');
            if (sep >= 0 && sep + 1 < window.Text.Length)
                return CapitalizeFirst(window.Text.Substring(sep + 1).Trim());
            return string.Empty;
        }

        private static string CapitalizeFirst(string value)
        {
            if (string.IsNullOrEmpty(value)) return string.Empty;
            if (value.Length == 1) return value.ToUpperInvariant();
            return char.ToUpperInvariant(value[0]) + value.Substring(1);
        }
    }
}
