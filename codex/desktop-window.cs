using System;
using System.Runtime.InteropServices;

public static class CodexDesktopWindow
{
    private const int Style = -16;
    private const int ExtendedStyle = -20;
    private const int Child = 0x40000000;
    private const int Popup = unchecked((int)0x80000000);
    private const int NoActivate = 0x08000000;
    private const uint KeepSize = 0x0001;
    private const uint KeepPosition = 0x0002;
    private const uint KeepZOrder = 0x0004;
    private const uint NoActivateOnMove = 0x0010;
    private const uint FrameChanged = 0x0020;

    public static IntPtr FindHost()
    {
        IntPtr shell = GetShellWindow();
        if (shell == IntPtr.Zero) return IntPtr.Zero;
        if (HasDesktopView(shell)) return shell;

        // Explorer can put the desktop icon view in a separate WorkerW window.
        uint shellProcess;
        GetWindowThreadProcessId(shell, out shellProcess);
        if (shellProcess == 0) return IntPtr.Zero;
        IntPtr worker = IntPtr.Zero;
        while ((worker = FindWindowEx(IntPtr.Zero, worker, "WorkerW", null)) != IntPtr.Zero)
        {
            uint workerProcess;
            GetWindowThreadProcessId(worker, out workerProcess);
            if (workerProcess == shellProcess && HasDesktopView(worker)) return worker;
        }
        return IntPtr.Zero;
    }

    public static bool Attach(IntPtr window, IntPtr host, int screenX, int screenY)
    {
        Point origin = new Point { X = screenX, Y = screenY };
        if (host == IntPtr.Zero || !ScreenToClient(host, ref origin)) return false;

        int style = GetWindowLong(window, Style);
        int extendedStyle = GetWindowLong(window, ExtendedStyle);
        SetWindowLong(window, Style, (style & ~Popup) | Child);
        SetWindowLong(window, ExtendedStyle, extendedStyle | NoActivate);
        SetParent(window, host);
        if (GetParent(window) == host)
        {
            // Put the panel above the desktop view within the shell's window.
            if (SetWindowPos(window, IntPtr.Zero, origin.X, origin.Y, 0, 0,
                KeepSize | NoActivateOnMove | FrameChanged)) return true;
            SetParent(window, IntPtr.Zero);
        }

        SetWindowLong(window, Style, style);
        SetWindowLong(window, ExtendedStyle, extendedStyle);
        return false;
    }

    public static bool Detach(IntPtr window)
    {
        SetParent(window, IntPtr.Zero);
        IntPtr parent = GetParent(window);
        if (parent != IntPtr.Zero && parent != GetDesktopWindow()) return false;

        SetWindowLong(window, Style, (GetWindowLong(window, Style) & ~Child) | Popup);
        SetWindowLong(window, ExtendedStyle, GetWindowLong(window, ExtendedStyle) & ~NoActivate);
        SetWindowPos(window, IntPtr.Zero, 0, 0, 0, 0,
            KeepSize | KeepPosition | KeepZOrder | NoActivateOnMove | FrameChanged);
        return true;
    }

    private static bool HasDesktopView(IntPtr window)
    {
        return FindWindowEx(window, IntPtr.Zero, "SHELLDLL_DefView", null) != IntPtr.Zero;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Point
    {
        public int X;
        public int Y;
    }

    [DllImport("user32.dll")]
    private static extern IntPtr GetShellWindow();

    [DllImport("user32.dll")]
    private static extern IntPtr GetDesktopWindow();

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern IntPtr FindWindowEx(IntPtr parent, IntPtr after, string className, string title);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);

    [DllImport("user32.dll")]
    private static extern IntPtr GetParent(IntPtr window);

    [DllImport("user32.dll")]
    private static extern IntPtr SetParent(IntPtr window, IntPtr parent);

    [DllImport("user32.dll", EntryPoint = "GetWindowLongW")]
    private static extern int GetWindowLong(IntPtr window, int index);

    [DllImport("user32.dll", EntryPoint = "SetWindowLongW")]
    private static extern int SetWindowLong(IntPtr window, int index, int value);

    [DllImport("user32.dll")]
    private static extern bool ScreenToClient(IntPtr window, ref Point point);

    [DllImport("user32.dll")]
    private static extern bool SetWindowPos(IntPtr window, IntPtr after, int x, int y, int width, int height, uint flags);
}
