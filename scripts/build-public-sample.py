import argparse
import json
import re
import secrets
from datetime import date, datetime

import pandas as pd


def text(value):
    if value is None or pd.isna(value):
        return ""
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    return str(value).strip()


def public_text(value):
    value = text(value)
    value = re.sub(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", "[email đã ẩn]", value, flags=re.I)
    return re.sub(r"(?:\+?\d[\d .()\-]{7,}\d)", "[số đã ẩn]", value)


def number(value):
    try:
        result = float(value)
        return result if pd.notna(result) else 0
    except (TypeError, ValueError):
        return 0


def percent(value):
    result = number(value)
    if -1 <= result <= 1:
        result *= 100
    return max(0, min(100, result))


def status(value):
    return re.sub(r"^\s*\d+\.\s*", "", text(value))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook")
    parser.add_argument("output")
    args = parser.parse_args()
    book = pd.ExcelFile(args.workbook)
    depts = pd.read_excel(book, sheet_name="KPIPhongBan").fillna("")
    people_rows = pd.read_excel(book, sheet_name="KPINhanVien").fillna("")
    project_rows = pd.read_excel(book, sheet_name="DuAn").fillna("")
    task_rows = pd.read_excel(book, sheet_name="CongViec").fillna("")

    raw_names = []
    for frame, column in ((people_rows, "HoVaTen"), (project_rows, "PIC"), (task_rows, "PIC")):
        if column in frame:
            raw_names.extend(frame[column].tolist())
    aliases = {}
    for raw in set(filter(None, map(text, raw_names))):
        aliases[raw.casefold()] = f"Nhân viên {secrets.token_hex(4).upper()}"

    def alias(value):
        raw = text(value)
        return aliases.get(raw.casefold(), "Chưa phân công") if raw else "Chưa phân công"

    departments = [
        {
            "name": text(r.PhongBan),
            "schoolYear": text(r.NamHoc),
            "achievement": percent(r.PhanTramDatKPI),
            "weight": number(r.TyTrongKPI),
            "result": text(r.KetQua),
            "employees": number(r.SoNhanSu),
            "projects": number(r.SoDuAn),
        }
        for r in depts.itertuples(index=False)
        if text(r.PhongBan) and text(r.NamHoc)
    ]
    people = [
        {
            "name": alias(r.HoVaTen),
            "department": text(r.PhongBan),
            "schoolYear": text(r.NamHoc),
            "achievement": percent(r.PhanTramDatKPI),
            "weight": number(r.TyTrongKPI),
            "result": text(r.KetQua),
        }
        for r in people_rows.itertuples(index=False)
        if text(r.HoVaTen) and text(r.PhongBan) and text(r.NamHoc)
    ]

    projects, project_by_id = [], {}
    for index, r in enumerate(project_rows.itertuples(index=False), start=1):
        source_id = text(r.DuAnID)
        project_year = text(r.NamHoc)
        name = public_text(r.YeuCau or r.NhomCongViec or f"Dự án {index}")
        project = {
            "key": f"project-{index}",
            "name": name,
            "kpi": public_text(r.KPI or r.YeuCau or r.NhomCongViec),
            "department": text(r.PhongBanPIC),
            "owner": alias(r.PIC),
            "schoolYear": project_year,
            "progress": percent(r.PhanTram),
            "start": text(r.NgayBatDau),
            "due": text(r.NgayKetThuc),
            "status": status(r.TrangThai),
        }
        if source_id:
            project_by_id[source_id] = project
        if text(r.TrangThai) and project_year:
            projects.append(project)

    tasks = []
    for index, r in enumerate(task_rows.itertuples(index=False), start=1):
        if not text(r.TrangThai):
            continue
        parent = project_by_id.get(text(r.DuAnID))
        if not parent or not parent["schoolYear"]:
            continue
        tasks.append(
            {
                "key": f"task-{index}",
                "name": public_text(r.TenCongViecChiTiet or r.TenCongViec or f"Công việc {index}"),
                "project": parent["name"] if parent else public_text(r.NhomCongViec),
                "kpi": parent["kpi"] if parent else public_text(r.NhomCongViec),
                "department": text(r.PhongBanPIC) or (parent["department"] if parent else ""),
                "owner": alias(r.PIC),
                "schoolYear": parent["schoolYear"],
                "progress": percent(r.TienDoCVDone),
                "start": text(r.NgayBatDau),
                "due": text(r.NgayKetThuc),
                "status": status(r.TrangThai),
            }
        )

    payload = {
        "updatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "privacy": "anonymized-sample",
        "departments": departments,
        "people": people,
        "projects": projects,
        "tasks": tasks,
    }
    with open(args.output, "w", encoding="utf-8") as output:
        output.write("window.KPI_SNAPSHOT = ")
        json.dump(payload, output, ensure_ascii=False, separators=(",", ":"))
        output.write(";\n")
    print({key: len(payload[key]) for key in ("departments", "people", "projects", "tasks")})


if __name__ == "__main__":
    main()
